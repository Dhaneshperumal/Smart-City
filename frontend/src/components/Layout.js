import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationAsRead } from '../services/api';

const Layout = () => {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const location = useLocation();

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Load notifications for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, location.pathname]);

  // Fetch user notifications
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await getNotifications({ limit: 10 });
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Handle marking a notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update the local state
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, status: { ...notification.status, read: true } } 
          : notification
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Responsive layout adjustments
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Get user role for conditional rendering
  const userRole = user?.roles?.[0] || 'user';

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Navbar 
        toggleSidebar={toggleSidebar} 
        notifications={notifications}
        unreadCount={unreadCount}
        notificationsLoading={notificationsLoading}
        onMarkAsRead={handleMarkAsRead}
        onRefreshNotifications={fetchNotifications}
      />
      
      <div className="content-container">
        {isAuthenticated && (
          <Sidebar 
            isOpen={sidebarOpen} 
            userRole={userRole}
          />
        )}
        
        <main className={`main-content ${sidebarOpen ? 'with-sidebar' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
