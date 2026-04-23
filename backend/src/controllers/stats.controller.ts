import { Request, Response } from 'express';
import { statsService } from '../services/stats.service.js';

export class StatsController {
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await statsService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
      });
    }
  }

  async getMonthlyStats(req: Request, res: Response): Promise<void> {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const stats = await statsService.getMonthlyStats(year);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch monthly stats',
      });
    }
  }

  async getConsumptionByDriver(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const stats = await statsService.getConsumptionByDriver(limit);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch consumption stats',
      });
    }
  }

  async getTopUnits(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const units = await statsService.getTopUnits(limit);
      res.status(200).json({ success: true, data: units });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch top units',
      });
    }
  }

  async getRecentTransactions(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const transactions = await statsService.getRecentTransactions(limit);
      res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch recent transactions',
      });
    }
  }

  async getReportStats(req: Request, res: Response): Promise<void> {
    try {
      const managerPubKey = req.query.managerPubKey as string | undefined;
      const stats = await statsService.getReportStats(managerPubKey);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch report stats',
      });
    }
  }

  async getDriverStats(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;
      if (!address) {
        res.status(400).json({ success: false, error: 'Driver address is required' });
        return;
      }
      const stats = await statsService.getDriverStats(address);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch driver stats',
      });
    }
  }

  async getStatsSummary(req: Request, res: Response): Promise<void> {
    try {
      const stats = await statsService.getStatsSummary();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stats summary',
      });
    }
  }
}

export const statsController = new StatsController();
