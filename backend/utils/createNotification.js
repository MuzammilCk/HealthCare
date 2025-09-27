const Notification = require('../models/Notification');

/**
 * Creates a new notification and sends it in real-time if user is online
 * @param {string} userId - The user ID who will receive the notification
 * @param {string} message - The notification message
 * @param {string} link - Optional link to navigate to when clicked
 * @param {string} type - Type of notification (appointment, prescription, kyc, system, reminder)
 * @param {object} metadata - Additional metadata for the notification
 * @returns {Promise<object>} The created notification object
 */
const createNotification = async (userId, message, link = '', type = 'system', metadata = {}) => {
  try {
    // Create notification in database
    const notification = new Notification({
      userId,
      message,
      link,
      type,
      metadata
    });

    await notification.save();

    // Send real-time notification if user is online
    if (global.sendNotification) {
      global.sendNotification(userId, {
        _id: notification._id,
        message: notification.message,
        link: notification.link,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt
      });
    }

    console.log(`Notification created for user ${userId}: ${message}`);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Creates multiple notifications for multiple users
 * @param {Array<string>} userIds - Array of user IDs
 * @param {string} message - The notification message
 * @param {string} link - Optional link to navigate to when clicked
 * @param {string} type - Type of notification
 * @param {object} metadata - Additional metadata
 * @returns {Promise<Array>} Array of created notifications
 */
const createBulkNotifications = async (userIds, message, link = '', type = 'system', metadata = {}) => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      message,
      link,
      type,
      metadata
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    // Send real-time notifications to online users
    if (global.sendNotification) {
      createdNotifications.forEach(notification => {
        global.sendNotification(notification.userId, {
          _id: notification._id,
          message: notification.message,
          link: notification.link,
          type: notification.type,
          read: notification.read,
          createdAt: notification.createdAt
        });
      });
    }

    console.log(`Bulk notifications created for ${userIds.length} users: ${message}`);
    return createdNotifications;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

/**
 * Creates notifications for all users with a specific role
 * @param {string} role - User role (admin, doctor, patient)
 * @param {string} message - The notification message
 * @param {string} link - Optional link to navigate to when clicked
 * @param {string} type - Type of notification
 * @param {object} metadata - Additional metadata
 * @returns {Promise<Array>} Array of created notifications
 */
const createRoleBasedNotifications = async (role, message, link = '', type = 'system', metadata = {}) => {
  try {
    const User = require('../models/User');
    const users = await User.find({ role }).select('_id');
    const userIds = users.map(user => user._id);

    if (userIds.length === 0) {
      console.log(`No users found with role: ${role}`);
      return [];
    }

    return await createBulkNotifications(userIds, message, link, type, metadata);
  } catch (error) {
    console.error('Error creating role-based notifications:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  createBulkNotifications,
  createRoleBasedNotifications
};
