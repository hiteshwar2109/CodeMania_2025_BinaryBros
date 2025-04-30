
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Upload, PlusCircle, FolderOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Material {
  id: string;
  title: string;
  description: string;
  filePath?: string;
  fileType?: string;
  createdAt: string;
}

const Materials = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("documents");
  const [files, setFiles] = useState<File[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState("");
  const [newMaterialDescription, setNewMaterialDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  
  // Fetch materials when component mounts
  useEffect(() => {
    if (user) {
      fetchMaterials();
      ensureStorageBucket();
    }
  }, [user]);
  
  const ensureStorageBucket = async () => {
    try {
      // Check if the materials bucket exists
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error("Error checking buckets:", error);
        return;
      }
      
      // If the bucket doesn't exist, we'll create it on first upload
      const materialsBucketExists = buckets?.some(bucket => bucket.name === 'materials');
      console.log("Materials bucket exists:", materialsBucketExists);
    } catch (error) {
      console.error("Error in ensureStorageBucket:", error);
    }
  };
  
  const fetchMaterials = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const transformedMaterials: Material[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          filePath: item.file_path,
          fileType: item.file_type,
          createdAt: item.created_at
        }));
        
        setMaterials(transformedMaterials);
      }
    } catch (error: any) {
      console.error("Error fetching materials:", error);
      toast.error("Failed to load materials");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    
    const file = fileList[0];
    setSelectedFile(file);
  };
  
  const handleSubmitMaterial = async () => {
    if (!user) {
      toast.error("You must be logged in to upload materials");
      return;
    }
    
    if (!newMaterialTitle.trim()) {
      toast.error("Please enter a title for your material");
      return;
    }
    
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    
    setIsLoading(true);
    try {
      // First, create the bucket if it doesn't exist (this will automatically happen with the upload)
      const timestamp = Date.now();
      const fileName = `${timestamp}-${selectedFile.name.replace(/\s+/g, '_')}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        if (uploadError.message.includes('bucket') && uploadError.message.includes('not found')) {
          toast.error("Storage bucket needs to be created. Please try again.");
          return;
        }
        throw uploadError;
      }
      
      // Then, create a record in the materials table
      const { data, error } = await supabase
        .from('materials')
        .insert({
          title: newMaterialTitle,
          description: newMaterialDescription,
          file_path: filePath,
          file_type: selectedFile.type,
          user_id: user.id
        })
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        const newMaterial: Material = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description || '',
          filePath: data[0].file_path,
          fileType: data[0].file_type,
          createdAt: data[0].created_at
        };
        
        setMaterials(prev => [newMaterial, ...prev]);
        toast.success("Material uploaded successfully");
        
        // Reset form
        setNewMaterialTitle("");
        setNewMaterialDescription("");
        setSelectedFile(null);
        setIsUploadDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Error uploading material:", error);
      toast.error(`Failed to upload material: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteMaterial = async (id: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Find the material to get the file path
      const material = materials.find(m => m.id === id);
      
      if (material?.filePath) {
        // Delete the file from storage
        const { error: deleteStorageError } = await supabase.storage
          .from('materials')
          .remove([material.filePath]);
          
        if (deleteStorageError) {
          console.error("Storage delete error:", deleteStorageError);
          // Continue with record deletion even if file deletion fails
        }
      }
      
      // Delete the record from the materials table
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setMaterials(prev => prev.filter(m => m.id !== id));
      toast.success("Material deleted successfully");
    } catch (error: any) {
      console.error("Error deleting material:", error);
      toast.error("Failed to delete material");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmitCourse = async () => {
    if (!newCourseName.trim()) {
      toast.error("Please enter a course name");
      return;
    }
    
    // Here we would typically save the course to the database
    // For now, just show a toast notification
    toast.success(`Course "${newCourseName}" created successfully`);
    setNewCourseName("");
    setNewCourseDescription("");
    setIsCourseDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
        <div className="flex space-x-2">
          <Button 
            className="bg-student-purple hover:bg-student-purple-dark"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Material
          </Button>
          <Button 
            className="bg-student-purple hover:bg-student-purple-dark"
            onClick={() => setIsCourseDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>
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
                {materials.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                    <div className="mx-auto flex flex-col items-center justify-center">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No documents yet</h3>
                      <p className="text-sm text-gray-500 mb-4">Upload your first document to get started</p>
                      <Button 
                        variant="outline" 
                        className="cursor-pointer bg-student-purple text-white hover:bg-student-purple-dark"
                        onClick={() => setIsUploadDialogOpen(true)}
                      >
                        Upload Document
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {materials.map((material) => (
                      <div 
                        key={material.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start">
                          <FileText className="h-5 w-5 mt-1 mr-3 text-student-purple" />
                          <div>
                            <h4 className="font-medium">{material.title}</h4>
                            {material.description && (
                              <p className="text-sm text-gray-500">{material.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(material.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-500"
                            onClick={() => handleDeleteMaterial(material.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
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
                {materials.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <FolderOpen className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No recent documents</p>
                    <p className="text-xs mt-1">Upload some files to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials.slice(0, 3).map((material) => (
                      <div key={material.id} className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-student-purple" />
                        <span className="text-sm truncate">{material.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  disabled={materials.length === 0}
                >
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
                <Button 
                  className="bg-student-purple hover:bg-student-purple-dark"
                  onClick={() => setIsCourseDialogOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Course
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Upload Material Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Upload Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Enter material title"
                value={newMaterialTitle}
                onChange={(e) => setNewMaterialTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter material description"
                value={newMaterialDescription}
                onChange={(e) => setNewMaterialDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file" className="text-sm font-medium">
                File
              </Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                <Input 
                  id="file" 
                  type="file" 
                  onChange={handleFileSelection}
                  className="hidden"
                />
                <label htmlFor="file" className="flex flex-col items-center cursor-pointer">
                  <Upload className="h-6 w-6 text-gray-400 mb-2" />
                  {selectedFile ? (
                    <div className="text-center">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Click to select a file</p>
                  )}
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsUploadDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitMaterial} 
                disabled={isLoading || !selectedFile}
                className="bg-student-purple hover:bg-student-purple-dark"
              >
                {isLoading ? "Uploading..." : "Upload Material"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Create Course Dialog */}
      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="courseName" className="text-sm font-medium">
                Course Name
              </Label>
              <Input
                id="courseName"
                placeholder="Enter course name"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="courseDescription" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="courseDescription"
                placeholder="Enter course description"
                value={newCourseDescription}
                onChange={(e) => setNewCourseDescription(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCourseDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitCourse}
                className="bg-student-purple hover:bg-student-purple-dark"
              >
                Create Course
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Materials;
