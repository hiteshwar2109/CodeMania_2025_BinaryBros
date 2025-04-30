import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/sonner";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

type TaskContextType = {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  upcomingTasks: Task[];
  isLoading: boolean;
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
  const { user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch tasks when user changes or authentication status changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [user, isAuthenticated]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;

      // Transform the data to match our Task interface
      const transformedTasks: Task[] = data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        dueDate: task.due_date,
        priority: task.priority as "low" | "medium" | "high",
        completed: task.completed,
        category: task.category || '',
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }));

      setTasks(transformedTasks);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

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

  const addTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (!user) {
      toast.error("You must be logged in to add tasks");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: task.title,
          description: task.description,
          due_date: task.dueDate,
          priority: task.priority,
          completed: task.completed,
          category: task.category,
          user_id: user.id
        }])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        const newTask: Task = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description || '',
          dueDate: data[0].due_date,
          priority: data[0].priority as "low" | "medium" | "high",
          completed: data[0].completed,
          category: data[0].category || '',
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at
        };
        
        setTasks(prev => [...prev, newTask]);
        toast.success("Task added successfully");
        return newTask;
      }
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (id: string, updatedFields: Partial<Task>) => {
    setIsLoading(true);
    try {
      // Convert task fields to database column names
      const dbFields: any = {};
      if (updatedFields.title !== undefined) dbFields.title = updatedFields.title;
      if (updatedFields.description !== undefined) dbFields.description = updatedFields.description;
      if (updatedFields.dueDate !== undefined) dbFields.due_date = updatedFields.dueDate;
      if (updatedFields.priority !== undefined) dbFields.priority = updatedFields.priority;
      if (updatedFields.completed !== undefined) dbFields.completed = updatedFields.completed;
      if (updatedFields.category !== undefined) dbFields.category = updatedFields.category;
      
      const { data, error } = await supabase
        .from('tasks')
        .update(dbFields)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        const updatedTask: Task = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description || '',
          dueDate: data[0].due_date,
          priority: data[0].priority as "low" | "medium" | "high",
          completed: data[0].completed,
          category: data[0].category || '',
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at
        };
        
        setTasks(prev => 
          prev.map(task => 
            task.id === id ? updatedTask : task
          )
        );
        
        toast.success("Task updated successfully");
        
        // If the task was marked as completed, create a notification
        if (updatedFields.completed === true && user) {
          await supabase
            .from('notifications')
            .insert([{
              user_id: user.id,
              title: 'Task Completed',
              message: `You've completed: ${updatedTask.title}`,
              type: 'task',
              is_read: false,
              related_item_id: id
            }]);
        }
      }
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success("Task deleted successfully");
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
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
        isLoading,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
