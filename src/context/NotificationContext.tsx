
import { createContext, useContext, useState, useEffect } from "react";
import { DatabaseService, DbNotification } from "../services/DatabaseService";
import { useAuth } from "./AuthContext";

type NotificationContextType = {
  notifications: DbNotification[];
  unreadCount: number;
  fetchNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  createNotification: (notification: Omit<DbNotification, 'id' | 'createdAt'>) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const fetchNotifications = () => {
    if (!user) return;
    
    const userNotifications = DatabaseService.getNotificationsByUserId(user.id);
    setNotifications(userNotifications);
    setUnreadCount(userNotifications.filter(n => !n.isRead).length);
  };

  const markAsRead = (id: string) => {
    try {
      DatabaseService.markNotificationAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = () => {
    if (!user) return;
    
    try {
      DatabaseService.markAllNotificationsAsRead(user.id);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = (id: string) => {
    try {
      DatabaseService.deleteNotification(id);
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const createNotification = (notification: Omit<DbNotification, 'id' | 'createdAt'>) => {
    try {
      DatabaseService.createNotification(notification);
      fetchNotifications();
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        createNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
