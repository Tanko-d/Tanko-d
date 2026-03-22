import {
  FundRequest,
  FundRequestPayload,
  ApproveFundRequestPayload,
  RejectFundRequestPayload,
  CreateEscrowPayload,
  EscrowResponse,
  TestnetAccount,
} from '../types/index.js';
import { trustlessWorkService } from './trustlessWork.service.js';
import { stellarService } from './stellar.service.js';
import { fundRequestStore } from './funds.store.js';
import axios from 'axios';

export class FundsService {
  async createRequest(
    driverPublicKey: string,
    payload: FundRequestPayload,
    managerPublicKey: string
  ): Promise<{ success: boolean; data?: FundRequest; error?: string }> {
    if (!stellarService.validatePublicKey(driverPublicKey)) {
      return { success: false, error: 'Invalid driver public key' };
    }

    if (!stellarService.validatePublicKey(managerPublicKey)) {
      return { success: false, error: 'Invalid manager public key' };
    }

    const amount = BigInt(payload.amount);
    if (amount <= BigInt(0)) {
      return { success: false, error: 'Amount must be positive' };
    }

    const request = fundRequestStore.create({
      driverPublicKey,
      managerPublicKey,
      amount: payload.amount,
      description: payload.description,
    });

    return { success: true, data: request };
  }

  async approveRequest(
    payload: ApproveFundRequestPayload,
    managerPublicKey: string
  ): Promise<{ success: boolean; data?: FundRequest; error?: string }> {
    if (!stellarService.validateSecretKey(payload.managerSecret)) {
      return { success: false, error: 'Invalid secret key' };
    }

    const request = fundRequestStore.getById(payload.requestId);
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: `Request is already ${request.status}` };
    }

    if (request.managerPublicKey !== managerPublicKey) {
      return { success: false, error: 'Only the assigned manager can approve this request' };
    }

    const usdcTrustline = {
      address: 'CBIELTK6YBZJU5UP2WWQAUYO4SJ2HBMQEFMU7HHD32YBXE7MKU65XABZ',
      decimals: 10000000,
    };

    const escrowPayload: CreateEscrowPayload = {
      signer: managerPublicKey,
      engagementId: `FUND-REQ-${request.id.substring(0, 8)}`,
      roles: {
        sender: managerPublicKey,
        approver: managerPublicKey,
        receiver: request.driverPublicKey,
      },
      amount: request.amount,
      description: request.description,
      trustline: usdcTrustline,
    };

    const escrowResult = await trustlessWorkService.createSingleReleaseEscrow(escrowPayload);

    if (!escrowResult.success || !escrowResult.data) {
      return { success: false, error: escrowResult.error || 'Failed to create escrow' };
    }

    const signedXdr = stellarService.signTransaction(
      escrowResult.data.xdr,
      payload.managerSecret
    );

    const submitResult = await stellarService.submitTransaction(signedXdr);

    fundRequestStore.update(request.id, {
      status: 'approved',
      contractId: escrowResult.data.contractId,
      escrowXdr: signedXdr,
    });

    return {
      success: true,
      data: fundRequestStore.getById(request.id),
    };
  }

  async releaseFunds(
    requestId: string,
    managerSecret: string,
    managerPublicKey: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!stellarService.validateSecretKey(managerSecret)) {
      return { success: false, error: 'Invalid secret key' };
    }

    const request = fundRequestStore.getById(requestId);
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'approved') {
      return { success: false, error: 'Request must be approved before releasing funds' };
    }

    if (!request.contractId) {
      return { success: false, error: 'No escrow contract associated' };
    }

    const escrowStatus = await trustlessWorkService.getEscrow(request.contractId);

    if (!escrowStatus.success || !escrowStatus.data) {
      return { success: false, error: 'Failed to get escrow status' };
    }

    if (escrowStatus.data.status === 'released') {
      return { success: false, error: 'Funds already released' };
    }

    if (escrowStatus.data.status !== 'funded' && escrowStatus.data.status !== 'initialized') {
      return { success: false, error: `Cannot release funds in status: ${escrowStatus.data.status}` };
    }

    const approveResult = await trustlessWorkService.approveMilestone({
      contractId: request.contractId,
      milestoneIndex: 0,
      signer: managerPublicKey,
      rolePublicKey: managerPublicKey,
    });

    if (!approveResult.success || !approveResult.data) {
      return { success: false, error: approveResult.error || 'Failed to approve milestone' };
    }

    const signedApproveXdr = stellarService.signTransaction(
      approveResult.data.xdr,
      managerSecret
    );
    await stellarService.submitTransaction(signedApproveXdr);

    const releaseResult = await trustlessWorkService.releaseFunds({
      contractId: request.contractId,
      signer: managerPublicKey,
      rolePublicKey: managerPublicKey,
    });

    if (!releaseResult.success || !releaseResult.data) {
      return { success: false, error: releaseResult.error || 'Failed to release funds' };
    }

    const signedReleaseXdr = stellarService.signTransaction(
      releaseResult.data.xdr,
      managerSecret
    );
    const txResult = await stellarService.submitTransaction(signedReleaseXdr);

    fundRequestStore.update(request.id, { status: 'released' });

    return { success: true, txHash: txResult.hash };
  }

  rejectRequest(
    payload: RejectFundRequestPayload,
    managerPublicKey: string
  ): { success: boolean; data?: FundRequest; error?: string } {
    const request = fundRequestStore.getById(payload.requestId);
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: `Cannot reject request with status: ${request.status}` };
    }

    if (request.managerPublicKey !== managerPublicKey) {
      return { success: false, error: 'Only the assigned manager can reject this request' };
    }

    fundRequestStore.update(request.id, {
      status: 'rejected',
    });

    return {
      success: true,
      data: fundRequestStore.getById(request.id),
    };
  }

  getRequest(id: string): { success: boolean; data?: FundRequest; error?: string } {
    const request = fundRequestStore.getById(id);
    if (!request) {
      return { success: false, error: 'Request not found' };
    }
    return { success: true, data: request };
  }

  getPendingRequests(managerPublicKey: string): { success: boolean; data?: FundRequest[] } {
    const requests = fundRequestStore.getPendingByManager(managerPublicKey);
    return { success: true, data: requests };
  }

  getRequestsByDriver(driverPublicKey: string): { success: boolean; data?: FundRequest[] } {
    const requests = fundRequestStore.getByDriver(driverPublicKey);
    return { success: true, data: requests };
  }

  async createTestnetAccount(): Promise<{ success: boolean; data?: TestnetAccount; error?: string }> {
    try {
      const keypair = stellarService.generateKeypair();

      await axios.get(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(keypair.publicKey)}`
      );

      return {
        success: true,
        data: {
          publicKey: keypair.publicKey,
          secret: keypair.secret,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create testnet account',
      };
    }
  }

  async fundTestnetAccount(publicKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      await axios.get(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
      );
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fund account',
      };
    }
  }

  async getEscrowStatus(contractId: string): Promise<{
    success: boolean;
    data?: { contractId: string; status: string; balance: string };
    error?: string;
  }> {
    const result = await trustlessWorkService.getEscrow(contractId);

    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Escrow not found' };
    }

    return {
      success: true,
      data: {
        contractId: result.data.contractId,
        status: result.data.status,
        balance: result.data.amount,
      },
    };
  }
}

export const fundsService = new FundsService();
