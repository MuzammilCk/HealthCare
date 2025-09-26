import { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();
  const { isAuthenticated } = useAuth();

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await api.get('/notifications?limit=20');
      if (response.data.success) {
        setNotifications(response.data.data);
        // Calculate unread count
        const unread = response.data.data.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count only
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.post('/notifications/mark-all-read');
      if (response.data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Mark a specific notification as read
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      if (response.data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      if (response.data.success) {
        // Update local state
        const deletedNotification = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Listen for real-time notifications
  useEffect(() => {
    if (socket && isAuthenticated) {
      const handleNewNotification = (notification) => {
        console.log('New notification received:', notification);
        
        // Add to notifications list
        setNotifications(prev => [notification, ...prev]);
        
        // Increment unread count
        setUnreadCount(prev => prev + 1);
        
        // Optional: Show browser notification
        if (Notification.permission === 'granted') {
          new Notification('Healthcare App', {
            body: notification.message,
            icon: '/favicon.ico',
          });
        }
      };

      socket.on('getNotification', handleNewNotification);

      return () => {
        socket.off('getNotification', handleNewNotification);
      };
    }
  }, [socket, isAuthenticated]);

  // Request notification permission
  useEffect(() => {
    if (isAuthenticated && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [isAuthenticated]);

  // Fetch notifications on mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAllAsRead,
    markAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
