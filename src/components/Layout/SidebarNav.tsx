
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { CalendarClock, BookOpen, MessageSquare, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: CalendarClock,
  },
  {
    title: "Study Materials",
    href: "/materials",
    icon: BookOpen,
  },
  {
    title: "AI Assistant",
    href: "/chatbot",
    icon: MessageSquare,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarNavProps {
  closeSidebar: () => void;
}

export function SidebarNav({ closeSidebar }: SidebarNavProps) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-6 mb-6">
        <h2 className="text-xl font-bold text-student-purple flex items-center">
          <span className="mr-2">📚</span>
          StudySmart
        </h2>
      </div>
      
      <div className="px-3 mb-6">
        <div className="bg-student-purple-light rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-student-purple text-white flex items-center justify-center text-lg font-semibold">
              {user?.name?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
              <p className="font-medium">{user?.name || "Student"}</p>
              <p className="text-xs text-gray-500">{user?.email || "student@example.com"}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={closeSidebar}
            className={cn(
              "flex items-center py-2.5 px-3 rounded-md text-sm font-medium",
              pathname === item.href
                ? "bg-student-purple text-white"
                : "text-gray-600 hover:bg-student-purple/10 hover:text-student-purple"
            )}
          >
            <item.icon className={cn("mr-3 h-4 w-4", pathname === item.href ? "text-white" : "")} />
            {item.title}
          </Link>
        ))}
      </div>
      
      <div className="px-3 mt-6">
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full py-2.5 px-3 text-sm font-medium text-gray-600 hover:bg-red-100 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}
