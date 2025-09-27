const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead
} = require('../controllers/notifications');
const { protect } = require('../middleware/auth');

// All notification routes require authentication
router.use(protect);

// GET /api/notifications - Get all notifications for the authenticated user
router.get('/', getNotifications);

// GET /api/notifications/unread-count - Get unread notifications count
router.get('/unread-count', getUnreadCount);

// PUT /api/notifications/:id/read - Mark a specific notification as read
router.put('/:id/read', markAsRead);

// POST /api/notifications/mark-all-read - Mark all notifications as read
router.post('/mark-all-read', markAllAsRead);

// DELETE /api/notifications/:id - Delete a specific notification
router.delete('/:id', deleteNotification);

// DELETE /api/notifications/delete-read - Delete all read notifications
router.delete('/delete-read', deleteAllRead);

module.exports = router;
