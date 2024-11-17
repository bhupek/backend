import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authentication';
import * as feeController from '../controllers/feeController';

const router = Router();

// Fee Management Routes
router.get('/structure', authenticate, feeController.getFeeStructure);
router.get('/pending', authenticate, feeController.getPendingFees);
router.get('/history', authenticate, feeController.getFeeHistory);
router.post('/pay', authenticate, feeController.makePayment);
router.get('/receipt/:id', authenticate, feeController.getReceipt);

// Admin only routes
router.post('/structure', authenticate, authorize('admin'), feeController.createFeeStructure);
router.put('/structure/:id', authenticate, authorize('admin'), feeController.updateFeeStructure);
router.post('/generate', authenticate, authorize('admin'), feeController.generateFeeCharges);

export default router; 