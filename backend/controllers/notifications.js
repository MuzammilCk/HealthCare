const Notification = require('../models/Notification');

/**
 * Get all notifications for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email role');

    const total = await Notification.countDocuments({ userId });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

/**
 * Get unread notifications count for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Notification.countDocuments({
      userId,
      read: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
};

/**
 * Mark a specific notification as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

/**
 * Mark all notifications as read for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
        message: `${result.modifiedCount} notifications marked as read`
      }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

/**
 * Delete a specific notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

/**
 * Get unread KYC notifications count for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUnreadKycCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadKycCount = await Notification.countDocuments({
      userId,
      type: 'kyc',
      read: false
    });

    res.json({
      success: true,
      data: { unreadKycCount }
    });
  } catch (error) {
    console.error('Error fetching unread KYC count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread KYC count'
    });
  }
};

/**
 * Delete all read notifications for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAllRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.deleteMany({
      userId,
      read: true
    });

    res.json({
      success: true,
      data: {
        deletedCount: result.deletedCount,
        message: `${result.deletedCount} read notifications deleted`
      }
    });
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete read notifications'
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  getUnreadKycCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead
};
