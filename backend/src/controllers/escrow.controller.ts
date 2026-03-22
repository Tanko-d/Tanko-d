import { Request, Response } from 'express';
import { trustlessWorkService } from '../services/trustlessWork.service.js';
import { stellarService } from '../services/stellar.service.js';
import {
  createEscrowSchema,
  fundEscrowSchema,
  approveMilestoneSchema,
  releaseFundsSchema,
  getEscrowSchema,
  setTrustlineSchema,
  getEscrowsByRoleSchema,
  getMultipleBalancesSchema,
  disputeEscrowSchema,
  resolveDisputeSchema,
} from '../utils/validators.js';
import { ZodError } from 'zod';

export class EscrowController {
  async createSingleReleaseEscrow(req: Request, res: Response): Promise<void> {
    try {
      const data = createEscrowSchema.parse(req.body);

      if (!stellarService.validatePublicKey(data.roles.sender)) {
        res.status(400).json({ success: false, error: 'Invalid sender address' });
        return;
      }
      if (!stellarService.validatePublicKey(data.roles.serviceProvider)) {
        res.status(400).json({ success: false, error: 'Invalid serviceProvider address' });
        return;
      }
      if (!stellarService.validatePublicKey(data.roles.platformAddress)) {
        res.status(400).json({ success: false, error: 'Invalid platformAddress' });
        return;
      }
      if (!stellarService.validatePublicKey(data.roles.releaseSigner)) {
        res.status(400).json({ success: false, error: 'Invalid releaseSigner address' });
        return;
      }
      if (!stellarService.validatePublicKey(data.roles.disputeResolver)) {
        res.status(400).json({ success: false, error: 'Invalid disputeResolver address' });
        return;
      }

      const result = await trustlessWorkService.createSingleReleaseEscrow(data);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.handleZodError(error, res);
    }
  }

  async createMultiReleaseEscrow(req: Request, res: Response): Promise<void> {
    try {
      const data = createEscrowSchema.parse(req.body);

      if (!stellarService.validatePublicKey(data.roles.serviceProvider)) {
        res.status(400).json({ success: false, error: 'Invalid serviceProvider address' });
        return;
      }
      if (!stellarService.validatePublicKey(data.roles.platformAddress)) {
        res.status(400).json({ success: false, error: 'Invalid platformAddress' });
        return;
      }
      if (!stellarService.validatePublicKey(data.roles.releaseSigner)) {
        res.status(400).json({ success: false, error: 'Invalid releaseSigner address' });
        return;
      }
      if (!stellarService.validatePublicKey(data.roles.disputeResolver)) {
        res.status(400).json({ success: false, error: 'Invalid disputeResolver address' });
        return;
      }

      const result = await trustlessWorkService.createMultiReleaseEscrow(data);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.handleZodError(error, res);
    }
  }

  async fundEscrow(req: Request, res: Response): Promise<void> {
    try {
      const data = fundEscrowSchema.parse(req.body);
      
      if (!stellarService.validatePublicKey(data.rolePublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const escrow = await trustlessWorkService.getEscrow(data.contractId);
      if (!escrow.success || !escrow.data) {
        res.status(404).json({ success: false, error: 'Escrow not found' });
        return;
      }

      const result = await trustlessWorkService.fundEscrow(data);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.handleZodError(error, res);
    }
  }

  async fundMultiReleaseEscrow(req: Request, res: Response): Promise<void> {
    try {
      const data = fundEscrowSchema.parse(req.body);
      
      if (!stellarService.validatePublicKey(data.rolePublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const result = await trustlessWorkService.fundMultiReleaseEscrow(data);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.handleZodError(error, res);
    }
  }

  async approveMilestone(req: Request, res: Response): Promise<void> {
    try {
      const data = approveMilestoneSchema.parse(req.body);
      
      if (!stellarService.validatePublicKey(data.rolePublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const escrow = await trustlessWorkService.getEscrow(data.contractId);
      if (!escrow.success || !escrow.data) {
        res.status(404).json({ success: false, error: 'Escrow not found' });
        return;
      }

      const result = await trustlessWorkService.approveMilestone(data);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.handleZodError(error, res);
    }
  }

  async approveMultiReleaseMilestone(req: Request, res: Response): Promise<void> {
    try {
      const data = approveMilestoneSchema.parse(req.body);
      
      if (!stellarService.validatePublicKey(data.rolePublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const result = await trustlessWorkService.approveMultiReleaseMilestone(data);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.handleZodError(error, res);
    }
  }

  async releaseFunds(req: Request, res: Response): Promise<void> {
    try {
      const data = releaseFundsSchema.parse(req.body);
      
      if (!stellarService.validatePublicKey(data.rolePublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const escrow = await trustlessWorkService.getEscrow(data.contractId);
      if (!escrow.success || !escrow.data) {
        res.status(404).json({ success: false, error: 'Escrow not found' });
        return;
      }

      const result = await trustlessWorkService.releaseFunds(data);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.handleZodError(error, res);
    }
  }

  async releaseMultiReleaseFunds(req: Request, res: Response): Promise<void> {
    try {
      const data = releaseFundsSchema.parse(req.body);
      
      if (!stellarService.validatePublicKey(data.rolePublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const result = await trustlessWorkService.releaseMultiReleaseFunds(data);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.handleZodError(error, res);
    }
  }

  async getEscrow(req: Request, res: Response): Promise<void> {
    try {
      const { contractId, type } = getEscrowSchema.parse(req.query);

      const result = type === 'multi'
        ? await trustlessWorkService.getMultiReleaseEscrow(contractId)
        : await trustlessWorkService.getEscrow(contractId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      this.handleZodError(error, res);
    }
  }

  async setTrustline(req: Request, res: Response): Promise<void> {
    try {
      const data = setTrustlineSchema.parse(req.body);
      
      if (!stellarService.validatePublicKey(data.publicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const result = await trustlessWorkService.setTrustline(data);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.handleZodError(error, res);
    }
  }

  async signAndSubmitTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { xdr, secret } = req.body as { xdr: string; secret: string };
      
      if (!secret || typeof secret !== 'string') {
        res.status(400).json({ success: false, error: 'Secret key is required' });
        return;
      }

      if (!stellarService.validateSecretKey(secret)) {
        res.status(400).json({ success: false, error: 'Invalid secret key' });
        return;
      }

      if (!xdr || typeof xdr !== 'string') {
        res.status(400).json({ success: false, error: 'XDR is required' });
        return;
      }

      const signedXdr = stellarService.signTransaction(xdr, secret);
      const result = await stellarService.submitTransaction(signedXdr);
      
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      });
    }
  }

  async getEscrowsByRole(req: Request, res: Response): Promise<void> {
    try {
      const data = getEscrowsByRoleSchema.parse(req.query);
      
      if (!stellarService.validatePublicKey(data.publicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const result = await trustlessWorkService.getEscrowsByRole(data.role, data.publicKey);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.handleZodError(error, res);
    }
  }

  async getMultipleBalances(req: Request, res: Response): Promise<void> {
    try {
      const data = getMultipleBalancesSchema.parse(req.body);
      const result = await trustlessWorkService.getMultipleEscrowBalances(data.contractIds);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.handleZodError(error, res);
    }
  }

  async disputeEscrow(req: Request, res: Response): Promise<void> {
    try {
      const data = disputeEscrowSchema.parse(req.body);
      
      if (!stellarService.validatePublicKey(data.rolePublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const result = await trustlessWorkService.disputeEscrow(
        data.contractId,
        data.signer,
        data.rolePublicKey,
        data.reason
      );
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.handleZodError(error, res);
    }
  }

  async resolveDispute(req: Request, res: Response): Promise<void> {
    try {
      const data = resolveDisputeSchema.parse(req.body);
      
      if (!stellarService.validatePublicKey(data.rolePublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const result = await trustlessWorkService.resolveDispute(
        data.contractId,
        data.signer,
        data.rolePublicKey,
        data.resolver,
        data.percentage
      );
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.handleZodError(error, res);
    }
  }

  private handleZodError(error: unknown, res: Response): void {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

export const escrowController = new EscrowController();
