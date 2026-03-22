import { Router } from 'express';
import { fundsController } from '../controllers/funds.controller.js';

const router = Router();

router.post('/funds/request', (req, res) => fundsController.createRequest(req, res));

router.post('/funds/approve', (req, res) => fundsController.approveRequest(req, res));

router.post('/funds/release', (req, res) => fundsController.releaseFunds(req, res));

router.post('/funds/reject', (req, res) => fundsController.rejectRequest(req, res));

router.get('/funds/request/:id', (req, res) => fundsController.getRequest(req, res));

router.get('/funds/pending', (req, res) => fundsController.getPendingRequests(req, res));

router.get('/funds/driver/:publicKey', (req, res) => fundsController.getRequestsByDriver(req, res));

router.post('/accounts/create', (req, res) => fundsController.createTestnetAccount(req, res));

router.post('/accounts/fund', (req, res) => fundsController.fundTestnetAccount(req, res));

router.get('/escrow/:contractId/status', (req, res) => fundsController.getEscrowStatus(req, res));

export default router;
