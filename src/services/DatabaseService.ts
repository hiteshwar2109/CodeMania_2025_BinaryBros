
// This file provides a mock database service using localStorage
// In a real app, this would be replaced with actual database calls

// Define interfaces for database entities
export interface DbTask {
  id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbUser {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this would be hashed
  preferences: {
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    theme: string;
  };
  createdAt: string;
}

export interface DbNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "task" | "reminder" | "system";
  isRead: boolean;
  relatedItemId?: string; // e.g., task ID if it's a task notification
  createdAt: string;
}

// Database service class
export class DatabaseService {
  // User methods
  static getUsers(): DbUser[] {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }

  static getUserById(id: string): DbUser | undefined {
    const users = this.getUsers();
    return users.find(user => user.id === id);
  }

  static getUserByEmail(email: string): DbUser | undefined {
    const users = this.getUsers();
    return users.find(user => user.email === email);
  }

  static createUser(user: Omit<DbUser, 'id' | 'createdAt'>): DbUser {
    const users = this.getUsers();
    
    // Check if user exists
    if (users.some(u => u.email === user.email)) {
      throw new Error('User with this email already exists');
    }

    const newUser: DbUser = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
  }

  static updateUser(id: string, userData: Partial<DbUser>): DbUser {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex] = { ...users[userIndex], ...userData };
    localStorage.setItem('users', JSON.stringify(users));
    return users[userIndex];
  }

  // Task methods
  static getTasks(): DbTask[] {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
  }

  static getTasksByUserId(userId: string): DbTask[] {
    const tasks = this.getTasks();
    return tasks.filter(task => task.userId === userId);
  }

  static getTaskById(id: string): DbTask | undefined {
    const tasks = this.getTasks();
    return tasks.find(task => task.id === id);
  }

  static createTask(task: Omit<DbTask, 'id' | 'createdAt' | 'updatedAt'>): DbTask {
    const tasks = this.getTasks();
    
    const newTask: DbTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Create a notification for this new task
    this.createNotification({
      userId: task.userId,
      title: 'New Task Created',
      message: `You have a new task: ${task.title}`,
      type: 'task',
      isRead: false,
      relatedItemId: newTask.id
    });
    
    return newTask;
  }

  static updateTask(id: string, taskData: Partial<DbTask>): DbTask {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    tasks[taskIndex] = { 
      ...tasks[taskIndex], 
      ...taskData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // If the task was marked as completed, create a notification
    if (taskData.completed && !tasks[taskIndex].completed) {
      this.createNotification({
        userId: tasks[taskIndex].userId,
        title: 'Task Completed',
        message: `You've completed: ${tasks[taskIndex].title}`,
        type: 'task',
        isRead: false,
        relatedItemId: id
      });
    }
    
    return tasks[taskIndex];
  }

  static deleteTask(id: string): void {
    const tasks = this.getTasks();
    const updatedTasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  }

  // Notification methods
  static getNotifications(): DbNotification[] {
    const notifications = localStorage.getItem('notifications');
    return notifications ? JSON.parse(notifications) : [];
  }

  static getNotificationsByUserId(userId: string): DbNotification[] {
    const notifications = this.getNotifications();
    return notifications.filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getUnreadNotificationCount(userId: string): number {
    const notifications = this.getNotifications();
    return notifications.filter(notification => notification.userId === userId && !notification.isRead).length;
  }

  static createNotification(notification: Omit<DbNotification, 'id' | 'createdAt'>): DbNotification {
    const notifications = this.getNotifications();
    
    const newNotification: DbNotification = {
      ...notification,
      id: `notification-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    notifications.push(newNotification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    return newNotification;
  }

  static markNotificationAsRead(id: string): DbNotification {
    const notifications = this.getNotifications();
    const notificationIndex = notifications.findIndex(notification => notification.id === id);
    
    if (notificationIndex === -1) {
      throw new Error('Notification not found');
    }

    notifications[notificationIndex] = { 
      ...notifications[notificationIndex], 
      isRead: true 
    };
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
    return notifications[notificationIndex];
  }

  static markAllNotificationsAsRead(userId: string): void {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.map(notification => {
      if (notification.userId === userId) {
        return { ...notification, isRead: true };
      }
      return notification;
    });
    
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  }

  static deleteNotification(id: string): void {
    const notifications = this.getNotifications();
    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  }
}
