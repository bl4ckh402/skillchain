import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";

export interface Attachment {
  name: string;
  url: string;
  type: string;
  size?: number;
}

/**
 * Upload files to Firebase Storage and return attachment objects
 */
export const uploadAttachments = async (
  files: File[],
  moduleId: string,
  lessonId: string
): Promise<Attachment[]> => {
  if (files.length === 0) return [];
  
  const attachments: Attachment[] = [];
  let successCount = 0;
  
  for (const file of files) {
    try {
      // Create a reference to the file in Firebase Storage
      const storageRef = ref(
        storage, 
        `course-attachments/${moduleId}/${lessonId}/${Date.now()}_${file.name}`
      );
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Add to attachments array
      attachments.push({
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
  
  // Show toast notification
  if (successCount > 0) {
    toast({
      title: "Files uploaded",
      description: `Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}.`,
    });
  }
  
  return attachments;
};

/**
 * Delete an attachment from Firebase Storage
 */
export const deleteAttachment = async (url: string): Promise<boolean> => {
  try {
    // Extract the storage path from the URL
    const storageRef = ref(storage, url);
    
    // Delete the file
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    toast({
      title: "Deletion failed",
      description: "Failed to delete the file. It may have been moved or deleted already.",
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Helper to get file type icon name based on file extension
 */
export const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
    return 'image';
  } else if (['pdf'].includes(extension || '')) {
    return 'pdf';
  } else if (['doc', 'docx', 'txt', 'md'].includes(extension || '')) {
    return 'document';
  } else if (['xls', 'xlsx', 'csv'].includes(extension || '')) {
    return 'spreadsheet';
  } else if (['ppt', 'pptx'].includes(extension || '')) {
    return 'presentation';
  } else if (['zip', 'rar', '7z'].includes(extension || '')) {
    return 'archive';
  } else if (['mp3', 'wav', 'ogg'].includes(extension || '')) {
    return 'audio';
  } else if (['mp4', 'avi', 'mov', 'webm'].includes(extension || '')) {
    return 'video';
  } else {
    return 'file';
  }
};