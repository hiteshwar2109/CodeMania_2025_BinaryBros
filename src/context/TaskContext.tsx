
import { createContext, useContext, useState, useEffect } from "react";
import { DatabaseService, DbTask } from "../services/DatabaseService";
import { useAuth } from "./AuthContext";

export type Task = Omit<DbTask, 'userId'>;

type TaskContextType = {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
  upcomingTasks: Task[];
};

const TaskContext = createContext<TaskContextType | null>(null);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  // Fetch tasks when user changes
  useEffect(() => {
    if (user) {
      const userTasks = DatabaseService.getTasksByUserId(user.id);
      setTasks(userTasks.map(task => {
        // Remove userId from tasks when providing to components
        const { userId, ...taskWithoutUserId } = task;
        return taskWithoutUserId;
      }));
    } else {
      // If no user is logged in, provide demo tasks
      setTasks([
        {
          id: "1",
          title: "Complete Math Assignment",
          description: "Chapter 5 problems 1-20",
          dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          priority: "high",
          completed: false,
          category: "Math",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Read History Chapter",
          description: "Chapter 3: World War II",
          dueDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
          priority: "medium",
          completed: false,
          category: "History",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Literature Essay Draft",
          description: "First draft of Shakespeare analysis",
          dueDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
          priority: "low",
          completed: false,
          category: "Literature",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    }
  }, [user]);

  // Get upcoming tasks (not completed, sorted by due date)
  const upcomingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      // Sort by priority first
      const priorityValues = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityValues[a.priority] - priorityValues[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by due date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const addTask = (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (!user) {
      console.error("Cannot add task: No user logged in");
      return;
    }

    try {
      const newTask = DatabaseService.createTask({
        ...task,
        userId: user.id,
      });
      
      // Remove userId from the task when providing to components
      const { userId, ...taskWithoutUserId } = newTask;
      setTasks(prev => [...prev, taskWithoutUserId]);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    try {
      const updatedTask = DatabaseService.updateTask(id, updatedFields);
      
      // Remove userId from the task when providing to components
      const { userId, ...taskWithoutUserId } = updatedTask;
      
      setTasks(prev => 
        prev.map(task => 
          task.id === id ? taskWithoutUserId : task
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = (id: string) => {
    try {
      DatabaseService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const getTaskById = (id: string) => {
    const task = tasks.find(task => task.id === id);
    return task;
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        getTaskById,
        upcomingTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
