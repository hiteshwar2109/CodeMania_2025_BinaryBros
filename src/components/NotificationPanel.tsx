
import { useTasks } from "@/context/TaskContext";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { upcomingTasks } = useTasks();
  
  // Group tasks by priority
  const highPriorityTasks = upcomingTasks.filter(task => task.priority === "high");
  const mediumPriorityTasks = upcomingTasks.filter(task => task.priority === "medium");
  const lowPriorityTasks = upcomingTasks.filter(task => task.priority === "low");
  
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
  
  // Helper to determine if a task is due soon (within 24 hours)
  const isDueSoon = (dateString: string) => {
    const taskDate = new Date(dateString).getTime();
    const now = Date.now();
    const hoursDiff = (taskDate - now) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  return (
    <div className="bg-white border-b border-border shadow-md max-h-[70vh] overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upcoming Tasks & Deadlines</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {upcomingTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No upcoming tasks or deadlines!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* High Priority Tasks */}
            {highPriorityTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-500 mb-2">High Priority</h3>
                <div className="space-y-2">
                  {highPriorityTasks.map(task => (
                    <div 
                      key={task.id}
                      className={`p-3 rounded-md border ${
                        isDueSoon(task.dueDate) 
                          ? 'border-red-200 bg-red-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{task.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isDueSoon(task.dueDate) 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-gray-500">{task.category}</span>
                        {isDueSoon(task.dueDate) && (
                          <span className="text-xs text-red-600 font-medium">Due Soon</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Medium Priority Tasks */}
            {mediumPriorityTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-orange-500 mb-2">Medium Priority</h3>
                <div className="space-y-2">
                  {mediumPriorityTasks.map(task => (
                    <div 
                      key={task.id}
                      className="p-3 rounded-md border border-gray-200 bg-white"
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{task.title}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <span className="text-xs text-gray-500">{task.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Low Priority Tasks */}
            {lowPriorityTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-blue-500 mb-2">Low Priority</h3>
                <div className="space-y-2">
                  {lowPriorityTasks.map(task => (
                    <div 
                      key={task.id}
                      className="p-3 rounded-md border border-gray-200 bg-white"
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{task.title}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <span className="text-xs text-gray-500">{task.category}</span>
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
