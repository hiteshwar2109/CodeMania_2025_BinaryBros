
import { createContext, useContext, useState, useEffect } from "react";

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  category: string;
};

type TaskContextType = {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
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
  const [tasks, setTasks] = useState<Task[]>(() => {
    const storedTasks = localStorage.getItem("tasks");
    return storedTasks
      ? JSON.parse(storedTasks)
      : [
          {
            id: "1",
            title: "Complete Math Assignment",
            description: "Chapter 5 problems 1-20",
            dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            priority: "high",
            completed: false,
            category: "Math",
          },
          {
            id: "2",
            title: "Read History Chapter",
            description: "Chapter 3: World War II",
            dueDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
            priority: "medium",
            completed: false,
            category: "History",
          },
          {
            id: "3",
            title: "Literature Essay Draft",
            description: "First draft of Shakespeare analysis",
            dueDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
            priority: "low",
            completed: false,
            category: "Literature",
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

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

  const addTask = (task: Omit<Task, "id">) => {
    const newTask = {
      ...task,
      id: crypto.randomUUID(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, ...updatedFields } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
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
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
