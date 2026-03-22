import { Request, Response } from 'express';
import { fundsService } from '../services/funds.service.js';
import { stellarService } from '../services/stellar.service.js';
import { z } from 'zod';

const createRequestSchema = z.object({
  driverPublicKey: z.string().min(1),
  amount: z.string().min(1),
  description: z.string().min(1),
});

const approveRequestSchema = z.object({
  requestId: z.string().uuid(),
  managerSecret: z.string().min(1),
  createNewEscrow: z.boolean().optional().default(true),
});

const rejectRequestSchema = z.object({
  requestId: z.string().uuid(),
  reason: z.string().optional(),
});

export class FundsController {
  async createRequest(req: Request, res: Response): Promise<void> {
    try {
      const { managerPublicKey } = req.body;

      if (!managerPublicKey || typeof managerPublicKey !== 'string') {
        res.status(400).json({ success: false, error: 'managerPublicKey is required' });
        return;
      }

      if (!stellarService.validatePublicKey(managerPublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid manager public key' });
        return;
      }

      const validation = createRequestSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const result = await fundsService.createRequest(
        validation.data.driverPublicKey,
        {
          amount: validation.data.amount,
          description: validation.data.description,
        },
        managerPublicKey
      );

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async approveRequest(req: Request, res: Response): Promise<void> {
    try {
      const { managerPublicKey } = req.body;

      if (!managerPublicKey || typeof managerPublicKey !== 'string') {
        res.status(400).json({ success: false, error: 'managerPublicKey is required' });
        return;
      }

      if (!stellarService.validatePublicKey(managerPublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid manager public key' });
        return;
      }

      const validation = approveRequestSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const result = await fundsService.approveRequest(
        {
          requestId: validation.data.requestId,
          managerSecret: validation.data.managerSecret,
          createNewEscrow: validation.data.createNewEscrow,
        },
        managerPublicKey
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async releaseFunds(req: Request, res: Response): Promise<void> {
    try {
      const { requestId, managerSecret, managerPublicKey } = req.body;

      if (!requestId || !managerSecret || !managerPublicKey) {
        res.status(400).json({ success: false, error: 'requestId, managerSecret, and managerPublicKey are required' });
        return;
      }

      if (!stellarService.validatePublicKey(managerPublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid manager public key' });
        return;
      }

      const result = await fundsService.releaseFunds(requestId, managerSecret, managerPublicKey);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: { txHash: result.txHash },
          message: 'Funds released successfully',
        });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async rejectRequest(req: Request, res: Response): Promise<void> {
    try {
      const { managerPublicKey } = req.body;

      if (!managerPublicKey || typeof managerPublicKey !== 'string') {
        res.status(400).json({ success: false, error: 'managerPublicKey is required' });
        return;
      }

      if (!stellarService.validatePublicKey(managerPublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid manager public key' });
        return;
      }

      const validation = rejectRequestSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.error.errors,
        });
        return;
      }

      const result = fundsService.rejectRequest(
        {
          requestId: validation.data.requestId,
          reason: validation.data.reason,
        },
        managerPublicKey
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ success: false, error: 'Request ID is required' });
        return;
      }

      const result = fundsService.getRequest(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getPendingRequests(req: Request, res: Response): Promise<void> {
    try {
      const { managerPublicKey } = req.query;

      if (typeof managerPublicKey !== 'string') {
        res.status(400).json({ success: false, error: 'managerPublicKey query parameter is required' });
        return;
      }

      if (!stellarService.validatePublicKey(managerPublicKey)) {
        res.status(400).json({ success: false, error: 'Invalid manager public key' });
        return;
      }

      const result = fundsService.getPendingRequests(managerPublicKey);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getRequestsByDriver(req: Request, res: Response): Promise<void> {
    try {
      const { publicKey } = req.params;

      if (!publicKey) {
        res.status(400).json({ success: false, error: 'Public key is required' });
        return;
      }

      if (!stellarService.validatePublicKey(publicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const result = fundsService.getRequestsByDriver(publicKey);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
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
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async fundTestnetAccount(req: Request, res: Response): Promise<void> {
    try {
      const { publicKey } = req.body;

      if (!publicKey || typeof publicKey !== 'string') {
        res.status(400).json({ success: false, error: 'publicKey is required' });
        return;
      }

      if (!stellarService.validatePublicKey(publicKey)) {
        res.status(400).json({ success: false, error: 'Invalid public key' });
        return;
      }

      const result = await fundsService.fundTestnetAccount(publicKey);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Account funded with 10,000 XLM (testnet)',
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  async getEscrowStatus(req: Request, res: Response): Promise<void> {
    try {
      const { contractId } = req.params;

      if (!contractId) {
        res.status(400).json({ success: false, error: 'Contract ID is required' });
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
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}

export const fundsController = new FundsController();
