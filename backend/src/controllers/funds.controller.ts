import { Request, Response } from 'express';
import { fundsService, CreateFundRequestInput, ApproveFundRequestInput, ReleaseFundsInput, RejectFundRequestInput } from '../services/funds.service.js';
import { stellarService } from '../services/stellar.service.js';

export class FundsController {
  async createRequest(req: Request, res: Response): Promise<void> {
    try {
      const { driverPubKey, managerPubKey, liters, amount, description } = req.body;

      if (!driverPubKey || !managerPubKey || !liters || !amount) {
        res.status(400).json({ success: false, error: 'driverPubKey, managerPubKey, liters, and amount are required' });
        return;
      }

      if (!stellarService.validatePublicKey(driverPubKey)) {
        res.status(400).json({ success: false, error: 'Invalid driver public key' });
        return;
      }

      if (!stellarService.validatePublicKey(managerPubKey)) {
        res.status(400).json({ success: false, error: 'Invalid manager public key' });
        return;
      }

      const input: CreateFundRequestInput = {
        driverPubKey,
        managerPubKey,
        liters: parseFloat(liters),
        amount: parseFloat(amount),
        description,
      };

      const result = await fundsService.createRequest(input);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create fund request',
      });
    }
  }

  async approveRequest(req: Request, res: Response): Promise<void> {
    try {
      const { requestId, managerSecret, managerPubKey } = req.body;

      if (!requestId || !managerPubKey) {
        res.status(400).json({ success: false, error: 'requestId and managerPubKey are required' });
        return;
      }

      if (!stellarService.validatePublicKey(managerPubKey)) {
        res.status(400).json({ success: false, error: 'Invalid manager public key' });
        return;
      }

      if (managerSecret && !stellarService.validateSecretKey(managerSecret)) {
        res.status(400).json({ success: false, error: 'Invalid secret key' });
        return;
      }

      const input: ApproveFundRequestInput = { requestId, managerSecret };
      const result = await fundsService.approveRequest(input, managerPubKey);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const statusCode =
          typeof result.error === 'string' &&
          result.error.toLowerCase().includes('failed to create escrow')
            ? 502
            : 400;
        res.status(statusCode).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to approve fund request',
      });
    }
  }

  async releaseFunds(req: Request, res: Response): Promise<void> {
    try {
      const { requestId, managerSecret, managerPubKey } = req.body;

      if (!requestId || !managerSecret || !managerPubKey) {
        res.status(400).json({ success: false, error: 'requestId, managerSecret, and managerPubKey are required' });
        return;
      }

      if (!stellarService.validatePublicKey(managerPubKey)) {
        res.status(400).json({ success: false, error: 'Invalid manager public key' });
        return;
      }

      const input: ReleaseFundsInput = { requestId, managerSecret, managerPubKey };
      const result = await fundsService.releaseFunds(input);

      if (result.success) {
        res.status(200).json({ success: true, txHash: result.txHash });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to release funds',
      });
    }
  }

  async rejectRequest(req: Request, res: Response): Promise<void> {
    try {
      const { requestId, managerPubKey } = req.body;

      if (!requestId || !managerPubKey) {
        res.status(400).json({ success: false, error: 'requestId and managerPubKey are required' });
        return;
      }

      if (!stellarService.validatePublicKey(managerPubKey)) {
        res.status(400).json({ success: false, error: 'Invalid manager public key' });
        return;
      }

      const input: RejectFundRequestInput = { requestId };
      const result = await fundsService.rejectRequest(input, managerPubKey);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject fund request',
      });
    }
  }

  async getRequest(req: Request, res: Response): Promise<void> {
    try {
      const result = await fundsService.getRequest(req.params.id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch fund request',
      });
    }
  }

  async getPendingRequests(req: Request, res: Response): Promise<void> {
    try {
      const managerPubKey = req.query.managerPubKey as string;

      if (!managerPubKey) {
        res.status(400).json({ success: false, error: 'managerPubKey is required' });
        return;
      }

      if (!stellarService.validatePublicKey(managerPubKey)) {
        res.status(400).json({ success: false, error: 'Invalid manager public key' });
        return;
      }

      const result = await fundsService.getPendingRequests(managerPubKey);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pending requests',
      });
    }
  }

  async getRequestsByDriver(req: Request, res: Response): Promise<void> {
    try {
      const driverPubKey = req.params.driverPubKey;

      if (!driverPubKey) {
        res.status(400).json({ success: false, error: 'driverPubKey is required' });
        return;
      }

      if (!stellarService.validatePublicKey(driverPubKey)) {
        res.status(400).json({ success: false, error: 'Invalid driver public key' });
        return;
      }

      const result = await fundsService.getRequestsByDriver(driverPubKey);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch driver requests',
      });
    }
  }

  async createTestnetAccount(req: Request, res: Response): Promise<void> {
    try {
      const result = await fundsService.createTestnetAccount();

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Testnet account created. Fund with Friendbot.',
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create testnet account',
      });
    }
  }

  async fundTestnetAccount(req: Request, res: Response): Promise<void> {
    try {
      const { publicKey } = req.body;

      if (!publicKey) {
        res.status(400).json({ success: false, error: 'publicKey is required' });
        return;
      }

      if (!stellarService.validatePublicKey(publicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const result = await fundsService.fundTestnetAccount(publicKey);

      if (result.success) {
        res.status(200).json({ success: true, message: 'Account funded with 10,000 XLM (testnet)' });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fund testnet account',
      });
    }
  }

  async getEscrowStatus(req: Request, res: Response): Promise<void> {
    try {
      const { contractId } = req.params;

      if (!contractId) {
        res.status(400).json({ success: false, error: 'contractId is required' });
        return;
      }

      const result = await fundsService.getEscrowStatus(contractId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch escrow status',
      });
    }
  }

  async getEscrowConfig(req: Request, res: Response): Promise<void> {
    try {
      const result = await fundsService.getEscrowConfig();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch escrow config',
      });
    }
  }

  async updateEscrowConfig(req: Request, res: Response): Promise<void> {
    try {
      const result = await fundsService.updateEscrowConfig(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update escrow config',
      });
    }
  }
}

export const fundsController = new FundsController();
