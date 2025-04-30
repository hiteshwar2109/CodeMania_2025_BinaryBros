
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";

const Profile = () => {
  const { user } = useAuth();
  
  const handleSave = () => {
    toast.success("Profile changes saved!");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:space-x-4">
                <div className="flex-1 space-y-2 mb-4 md:mb-0">
                  <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                  <Input id="firstName" defaultValue={user?.name?.split(' ')[0] || ""} />
                </div>
                <div className="flex-1 space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                  <Input id="lastName" defaultValue={user?.name?.split(' ')[1] || ""} />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                <p className="text-xs text-gray-500">Your email address is used for account-related notifications</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="institution" className="text-sm font-medium">Institution</label>
                <Input id="institution" placeholder="University, School, or Organization" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="fieldOfStudy" className="text-sm font-medium">Field of Study</label>
                <Input id="fieldOfStudy" placeholder="Computer Science, Medicine, Arts, etc." />
              </div>
              
              <div className="pt-4">
                <Button className="bg-student-purple hover:bg-student-purple-dark" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a photo for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" alt={user?.name || "Student"} />
                <AvatarFallback className="text-2xl bg-student-purple text-white">
                  {user?.name?.[0]?.toUpperCase() || "S"}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <p className="text-sm font-medium">{user?.name || "Student"}</p>
                <p className="text-xs text-gray-500">{user?.email || "student@example.com"}</p>
              </div>
              
              <Button variant="outline" size="sm">
                Change Picture
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Study Preferences</CardTitle>
          <CardDescription>Customize your study experience</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6 text-gray-500">
            Study preferences will be available in a future update
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
