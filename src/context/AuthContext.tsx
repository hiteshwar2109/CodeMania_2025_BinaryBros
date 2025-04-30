
import { createContext, useContext, useState, useEffect } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage on component mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This is a mock login - in a real app you would call your auth API
      if (email && password) {
        // Check if this user exists in mock storage
        const usersStr = localStorage.getItem("users") || "[]";
        const users = JSON.parse(usersStr);
        const existingUser = users.find((u: any) => u.email === email);
        
        if (existingUser && existingUser.password === password) {
          const authenticatedUser = {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
          };
          
          setUser(authenticatedUser);
          localStorage.setItem("user", JSON.stringify(authenticatedUser));
          return;
        }
        
        throw new Error("Invalid credentials");
      }
      throw new Error("Invalid credentials");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // This is a mock registration - in a real app you would call your auth API
      const usersStr = localStorage.getItem("users") || "[]";
      const users = JSON.parse(usersStr);
      
      // Check if user already exists
      if (users.some((user: any) => user.email === email)) {
        throw new Error("User already exists with this email");
      }
      
      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        password, // In a real app, NEVER store plain text passwords
      };
      
      // Save to mock storage
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      
      // Login the user
      const authenticatedUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      };
      
      setUser(authenticatedUser);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
