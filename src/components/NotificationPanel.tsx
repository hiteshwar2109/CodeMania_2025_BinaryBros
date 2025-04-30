
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import { X, Check, Bell, Trash2 } from "lucide-react";
import { useEffect } from "react";

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  
  // Helper to format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Group notifications by type
  const taskNotifications = notifications.filter(notification => notification.type === 'task');
  const reminderNotifications = notifications.filter(notification => notification.type === 'reminder');
  const systemNotifications = notifications.filter(notification => notification.type === 'system');

  return (
    <div className="bg-white border-b border-border shadow-md max-h-[70vh] overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => markAllAsRead()}
              className="text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No notifications yet!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Task Notifications */}
            {taskNotifications.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-student-purple mb-2">Tasks</h3>
                <div className="space-y-2">
                  {taskNotifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`p-3 rounded-md border ${
                        notification.isRead 
                          ? 'border-gray-200 bg-white' 
                          : 'border-student-purple-light bg-student-background'
                      }`}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex justify-between mt-2">
                        <div>
                          {!notification.isRead && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs p-1 h-auto"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark as read
                            </Button>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs p-1 h-auto text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reminder Notifications */}
            {reminderNotifications.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-blue-500 mb-2">Reminders</h3>
                <div className="space-y-2">
                  {reminderNotifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`p-3 rounded-md border ${
                        notification.isRead 
                          ? 'border-gray-200 bg-white' 
                          : 'border-blue-100 bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex justify-between mt-2">
                        <div>
                          {!notification.isRead && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs p-1 h-auto"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark as read
                            </Button>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs p-1 h-auto text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* System Notifications */}
            {systemNotifications.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">System</h3>
                <div className="space-y-2">
                  {systemNotifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`p-3 rounded-md border ${
                        notification.isRead 
                          ? 'border-gray-200 bg-white' 
                          : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex justify-between mt-2">
                        <div>
                          {!notification.isRead && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs p-1 h-auto"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark as read
                            </Button>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs p-1 h-auto text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
