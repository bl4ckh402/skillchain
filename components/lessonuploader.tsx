import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Upload, FileText, Image, File } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";

interface Attachment {
  name: string;
  url: string;
  type: string;
  size?: number;
}

interface LessonAttachmentsUploaderProps {
  moduleId: string;
  lessonId: string;
  existingAttachments: Attachment[];
  onAttachmentsChange: (moduleId: string, lessonId: string, attachments: Attachment[]) => void;
}

export function LessonAttachmentsUploader({
  moduleId,
  lessonId,
  existingAttachments = [],
  onAttachmentsChange,
}: LessonAttachmentsUploaderProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(existingAttachments);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get file type icon based on file extension
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    } else if (['pdf'].includes(extension || '')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else if (['doc', 'docx', 'txt', 'md'].includes(extension || '')) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    } else if (['xls', 'xlsx', 'csv'].includes(extension || '')) {
      return <FileText className="h-4 w-4 text-green-500" />;
    } else if (['ppt', 'pptx'].includes(extension || '')) {
      return <FileText className="h-4 w-4 text-orange-500" />;
    } else if (['zip', 'rar', '7z'].includes(extension || '')) {
      return <File className="h-4 w-4 text-purple-500" />;
    } else {
      return <File className="h-4 w-4 text-slate-500" />;
    }
  };

  // Function to handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setProgress(0);
    
    const newAttachments: Attachment[] = [...attachments];
    const fileArray = Array.from(files);
    let successCount = 0;
    
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      try {
        // Update progress
        setProgress(Math.round((i / fileArray.length) * 100));
        
        // Create a reference to the file in Firebase Storage
        const storageRef = ref(storage, `course-attachments/${moduleId}/${lessonId}/${Date.now()}_${file.name}`);
        
        // Upload the file
        await uploadBytes(storageRef, file);
        
        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);
        
        // Add to attachments array
        newAttachments.push({
          name: file.name,
          url: downloadURL,
          type: file.type,
          size: file.size
        });
        
        successCount++;
      } catch (error) {
        console.error("Error uploading file:", error);
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive"
        });
      }
    }
    
    setAttachments(newAttachments);
    onAttachmentsChange(moduleId, lessonId, newAttachments);
    
    setUploading(false);
    setProgress(100);
    
    // Show toast notification
    if (successCount > 0) {
      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}.`,
      });
    }
  };

  // Function to remove an attachment
  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
    onAttachmentsChange(moduleId, lessonId, newAttachments);
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${Math.round(kb)} KB`;
    } else {
      return `${(kb / 1024).toFixed(2)} MB`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Attachments</Label>
        <div className="flex flex-wrap gap-2 mb-4">
          {attachments.map((attachment, index) => (
            <Badge
              key={index}
              variant="outline"
              className="flex items-center gap-2 py-1.5 px-3 max-w-full text-sm"
            >
              {getFileIcon(attachment.name)}
              <span className="truncate max-w-[200px]">{attachment.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="ml-1 rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {attachments.length === 0 && (
            <span className="text-sm text-slate-500 dark:text-slate-400">No attachments yet</span>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          multiple
        />
        <Button
          type="button"
          variant="outline"
          className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading... {progress}%
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Attachments
            </>
          )}
        </Button>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload resources, handouts, code samples, or other materials. Supported formats: PDF, images, documents, spreadsheets, zip files.
        </p>
      </div>
    </div>
  );
}