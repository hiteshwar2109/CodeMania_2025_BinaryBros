
import { useTasks, Task } from "@/context/TaskContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, BookOpen, MessageSquare, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const { tasks, upcomingTasks } = useTasks();
  
  // Get today's and tomorrow's tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  
  const todayTasks = upcomingTasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  });
  
  const tomorrowTasks = upcomingTasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === tomorrow.getTime();
  });
  
  // Calculate completion stats
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  // Get counts by category
  const categoryCounts: Record<string, number> = {};
  tasks.forEach(task => {
    if (categoryCounts[task.category]) {
      categoryCounts[task.category]++;
    } else {
      categoryCounts[task.category] = 1;
    }
  });
  
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Study Dashboard</h1>
        <Button className="bg-student-purple hover:bg-student-purple-dark">Add New Task</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tasks Today</CardTitle>
            <CardDescription>Priorities for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-student-purple">
              {todayTasks.length}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {todayTasks.length === 0 ? "No tasks due today" : 
               todayTasks.length === 1 ? "1 task requires attention" : 
               `${todayTasks.length} tasks require attention`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completion Rate</CardTitle>
            <CardDescription>Your progress so far</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-student-purple">
              {completionRate}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-student-purple rounded-full h-2" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {completedTasks} of {tasks.length} tasks completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Coming Up</CardTitle>
            <CardDescription>Tomorrow's deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-student-purple">
              {tomorrowTasks.length}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {tomorrowTasks.length === 0 ? "No tasks due tomorrow" : 
               tomorrowTasks.length === 1 ? "1 task due tomorrow" : 
               `${tomorrowTasks.length} tasks due tomorrow`}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Your immediate priorities</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-center py-6 text-gray-500">No upcoming tasks. Add one to get started!</p>
            ) : (
              <div className="space-y-4">
                {upcomingTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 h-4 w-4 rounded-full flex-shrink-0 ${
                        task.priority === "high" ? "bg-red-500" :
                        task.priority === "medium" ? "bg-orange-400" : "bg-blue-400"
                      }`}></div>
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-gray-500">{task.description}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                
                {upcomingTasks.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" className="text-student-purple">
                      View All Tasks
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/chatbot">
                <MessageSquare className="mr-2 h-4 w-4 text-student-purple" />
                Ask AI Assistant
              </a>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/materials">
                <BookOpen className="mr-2 h-4 w-4 text-student-purple" />
                Upload Study Materials
              </a>
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <CalendarClock className="mr-2 h-4 w-4 text-student-purple" />
              Plan Study Schedule
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <CheckCircle className="mr-2 h-4 w-4 text-student-purple" />
              Mark Task Complete
            </Button>
            
            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">Top Subject Areas</h3>
              <div className="space-y-2">
                {topCategories.length > 0 ? (
                  topCategories.map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                      <span>{category}</span>
                      <span className="text-xs px-2 py-0.5 bg-student-purple-light text-student-purple rounded-full">
                        {count} tasks
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No categories yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
