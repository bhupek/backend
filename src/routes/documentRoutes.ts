import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authentication';
import * as documentController from '../controllers/documentController';

const router = Router();

// Document Management Routes
router.get('/', authenticate, documentController.getAllDocuments);
router.get('/:id', authenticate, documentController.getDocument);
router.post('/', authenticate, authorize(['admin', 'teacher']), documentController.uploadDocument);
router.delete('/:id', authenticate, authorize(['admin', 'teacher']), documentController.deleteDocument);

// Student Documents
router.get('/student/:studentId', authenticate, documentController.getStudentDocuments);
router.post('/student/:studentId', authenticate, documentController.uploadStudentDocument);

export default router; 