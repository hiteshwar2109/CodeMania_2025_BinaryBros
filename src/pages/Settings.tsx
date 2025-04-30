
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface UserPreferences {
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  theme: string;
}

const Settings = () => {
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user preferences
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data && data.preferences) {
          const preferences = data.preferences as UserPreferences;
          setNotificationsEnabled(preferences.notificationsEnabled ?? true);
          setEmailNotifications(preferences.emailNotifications ?? false);
          setTheme(preferences.theme ?? "light");
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchUserPreferences();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Save user preferences
  const savePreferences = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: {
            notificationsEnabled,
            emailNotifications,
            theme
          }
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-student-purple" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        {/* Notification Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-base font-medium">In-app Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications about tasks and reminders</p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="text-base font-medium">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                disabled={!notificationsEnabled}
              />
            </div>
          </div>
        </Card>
        
        {/* Appearance Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-2 block">Theme</Label>
              <div className="flex space-x-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className={theme === "light" ? "bg-student-purple" : ""}
                >
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className={theme === "dark" ? "bg-student-purple" : ""}
                >
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                  className={theme === "system" ? "bg-student-purple" : ""}
                >
                  System
                </Button>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Data Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Data</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Clear all saved data and reset preferences</p>
              <Button variant="destructive">Clear Data</Button>
            </div>
          </div>
        </Card>
        
        <div className="flex justify-end">
          <Button 
            onClick={savePreferences}
            disabled={isSaving}
            className="bg-student-purple hover:bg-student-purple-dark"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
