
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "task" | "reminder" | "system";
  isRead: boolean;
  relatedItemId?: string;
  createdAt: string;
}

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  createNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => Promise<void>;
  isLoading: boolean;
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
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications when user changes or authentication status changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, isAuthenticated]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Notification interface
      const transformedNotifications: Notification[] = data.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type as "task" | "reminder" | "system",
        isRead: notification.is_read,
        relatedItemId: notification.related_item_id || undefined,
        createdAt: notification.created_at
      }));

      setNotifications(transformedNotifications);
      setUnreadCount(transformedNotifications.filter(n => !n.isRead).length);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to update notification");
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to update notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      const deleted = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success("Notification deleted");
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    } finally {
      setIsLoading(false);
    }
  };

  const createNotification = async (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const validType = notification.type === "task" || 
                        notification.type === "reminder" || 
                        notification.type === "system" 
                        ? notification.type 
                        : "system";
                        
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          title: notification.title,
          message: notification.message,
          type: validType,
          is_read: false,
          related_item_id: notification.relatedItemId,
          user_id: user.id
        }])
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        const newNotification: Notification = {
          id: data[0].id,
          title: data[0].title,
          message: data[0].message,
          type: data[0].type as "task" | "reminder" | "system",
          isRead: data[0].is_read,
          relatedItemId: data[0].related_item_id || undefined,
          createdAt: data[0].created_at
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error("Error creating notification:", error);
      toast.error("Failed to create notification");
    } finally {
      setIsLoading(false);
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
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
