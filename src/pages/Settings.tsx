
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

const Settings = () => {
  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <Button className="bg-student-purple hover:bg-student-purple-dark" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="deadline-reminders" className="text-base">Deadline Reminders</Label>
                <p className="text-sm text-gray-500">Get notified about upcoming deadlines</p>
              </div>
              <Switch id="deadline-reminders" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="study-reminders" className="text-base">Study Reminders</Label>
                <p className="text-sm text-gray-500">Get notified about scheduled study sessions</p>
              </div>
              <Switch id="study-reminders" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ai-suggestions" className="text-base">AI Suggestions</Label>
                <p className="text-sm text-gray-500">Receive personalized study recommendations</p>
              </div>
              <Switch id="ai-suggestions" defaultChecked />
            </div>
          </div>
          
          <div className="space-y-2 pt-4">
            <Label htmlFor="reminder-timing">Reminder Timing</Label>
            <Select defaultValue="24h">
              <SelectTrigger>
                <SelectValue placeholder="Select when to receive reminders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hour before</SelectItem>
                <SelectItem value="3h">3 hours before</SelectItem>
                <SelectItem value="12h">12 hours before</SelectItem>
                <SelectItem value="24h">24 hours before</SelectItem>
                <SelectItem value="48h">48 hours before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
          <CardDescription>Configure your AI study companion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="use-history" className="text-base">Use Chat History</Label>
                <p className="text-sm text-gray-500">AI will remember past conversations</p>
              </div>
              <Switch id="use-history" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="proactive-help" className="text-base">Proactive Help</Label>
                <p className="text-sm text-gray-500">AI will suggest help without being asked</p>
              </div>
              <Switch id="proactive-help" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="anonymous-analytics" className="text-base">Anonymous Analytics</Label>
                <p className="text-sm text-gray-500">Help improve the AI by sharing anonymous usage data</p>
              </div>
              <Switch id="anonymous-analytics" defaultChecked />
            </div>
          </div>
          
          <div className="space-y-2 pt-4">
            <Label htmlFor="ai-verbosity">AI Response Length</Label>
            <Select defaultValue="balanced">
              <SelectTrigger>
                <SelectValue placeholder="Select AI verbosity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how StudySmart looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 pt-4">
            <Label htmlFor="theme-choice">Theme</Label>
            <Select defaultValue="light">
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System Default</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
