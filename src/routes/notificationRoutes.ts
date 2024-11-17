import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authentication';
import * as notificationController from '../controllers/notificationController';

const router = Router();

// Notification Routes
router.get('/', authenticate, notificationController.getNotifications);
router.get('/unread', authenticate, notificationController.getUnreadNotifications);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);

// Admin/Teacher only routes
router.post('/', authenticate, authorize(['admin', 'teacher']), notificationController.sendNotification);
router.post('/bulk', authenticate, authorize('admin'), notificationController.sendBulkNotifications);

export default router; 