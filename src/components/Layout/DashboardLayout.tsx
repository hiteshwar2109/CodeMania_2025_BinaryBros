
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { Navigate, Outlet } from "react-router-dom";
import { SidebarNav } from "./SidebarNav";
import { NotificationPanel } from "../NotificationPanel";
import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";

const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-subtle text-student-purple">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-student-background flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0 w-64" : "translate-x-[-100%] w-0"
        } transform transition-all duration-300 ease-in-out fixed md:static top-0 left-0 bottom-0 z-50 bg-white border-r border-border shadow-sm overflow-hidden`}
      >
        <SidebarNav closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-border h-16 flex items-center px-4 sticky top-0 z-30">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-2"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold text-student-purple md:text-xl">StudySmart Assistant</h1>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-student-purple rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Notification panel - slides in from top when active */}
        <div
          className={`fixed inset-x-0 top-16 z-40 transform transition-transform duration-300 ease-in-out ${
            notificationsOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <NotificationPanel onClose={() => setNotificationsOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
