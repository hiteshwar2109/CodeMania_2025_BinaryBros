
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Upload, PlusCircle, FolderOpen } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const Materials = () => {
  const [activeTab, setActiveTab] = useState("documents");
  const [files, setFiles] = useState<File[]>([]);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;
    
    const newFiles = Array.from(fileList);
    setFiles(prev => [...prev, ...newFiles]);
    
    toast.success(`Uploaded ${newFiles.length} file(s) successfully`);
    event.target.value = '';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
        <Button className="bg-student-purple hover:bg-student-purple-dark">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" /> Documents
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-2" /> Courses
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-full md:col-span-2">
              <CardHeader>
                <CardTitle>My Documents</CardTitle>
                <CardDescription>
                  Upload and manage your course materials, notes, and documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <div className="mx-auto flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Drop files to upload</h3>
                    <p className="text-sm text-gray-500 mb-4">or click to browse from your device</p>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      multiple
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer">
                        Browse Files
                      </Button>
                    </label>
                  </div>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Uploaded Files</h3>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Materials</CardTitle>
                <CardDescription>Your recently accessed documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 text-gray-500">
                  <FolderOpen className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No recent documents</p>
                  <p className="text-xs mt-1">Upload some files to get started</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" disabled>
                  Browse History
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="courses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Manage your enrolled courses and subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No courses added yet</h3>
                <p className="text-sm mb-4">Add your first course to organize your study materials</p>
                <Button className="bg-student-purple hover:bg-student-purple-dark">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Course
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Materials;
