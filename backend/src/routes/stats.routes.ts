import { Router } from 'express';
import { statsController } from '../controllers/stats.controller.js';

const router = Router();

router.get('/stats/dashboard', (req, res) => statsController.getDashboardStats(req, res));

router.get('/stats/monthly', (req, res) => statsController.getMonthlyStats(req, res));

router.get('/stats/consumption-by-driver', (req, res) => statsController.getConsumptionByDriver(req, res));

router.get('/stats/top-units', (req, res) => statsController.getTopUnits(req, res));

router.get('/stats/recent-transactions', (req, res) => statsController.getRecentTransactions(req, res));

router.get('/stats/reports', (req, res) => statsController.getReportStats(req, res));

router.get('/stats/summary', (req, res) => statsController.getStatsSummary(req, res));

router.get('/driver/:address/stats', (req, res) => statsController.getDriverStats(req, res));

export default router;
