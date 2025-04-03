"use client";

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCommunity } from "@/context/CommunityProvider";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "@/components/ui/use-toast";
import { X, Plus, Paperclip, Image } from "lucide-react";
import { TipTapEditor } from "@/components/tiptap-editor";
import { Post } from "@/types/community";

interface NewDiscussionModalProps {
  open: boolean;
  onClose: () => void;
}

type CategoryType =
  | "Smart Contracts"
  | "DeFi"
  | "NFTs"
  | "Web3"
  | "Governance"
  | "Security"
  | "Privacy"
  | "Frontend"
  | "Interoperability"
  | "Cryptography"
  | "General"
  | "";

export function NewDiscussionModal({ open, onClose }: NewDiscussionModalProps) {
  const { createPost, categories, uploadAttachment } = useCommunity();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<CategoryType>("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal closes
  const resetForm = useCallback(() => {
    setTitle("");
    setContent("");
    setCategory("");
    setTags([]);
    setTagInput("");
    setAttachments([]);
  }, []);

  // When modal closes, reset the form
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (attachments.length + newFiles.length <= 5) {
        setAttachments([...attachments, ...newFiles]);
      } else {
        toast({
          title: "Too many files",
          description: "You can upload a maximum of 5 files.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (value: string) => {
    // Validate that the value is one of our accepted categories
    const validCategory = value as CategoryType;
    setCategory(validCategory);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a discussion.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !content.trim() || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create a plain text preview from the HTML content
      const preview =
        content
          .replace(/<[^>]*>?/gm, "") // Remove HTML tags
          .substring(0, 150) + (content.length > 150 ? "..." : "");

      let attachmentsList: any = [];
      if (attachments.length > 0) {
        try {
          toast({
            title: "Uploading files",
            description: "Please wait while your files are being uploaded...",
          });

          // Upload each file and collect their URLs
          const uploadPromises = attachments.map(async (file) => {
            const url = await uploadAttachment(file);
            return {
              name: file.name,
              url: url,
              type: file.type.startsWith("image/")
                ? "image"
                : file.type.startsWith("video/")
                ? "video"
                : file.type.includes("application/pdf") ||
                  file.type.includes("text/plain") ||
                  file.type.includes("application/msword")
                ? "document"
                : file.type.includes("application/json") ||
                  file.name.endsWith(".js") ||
                  file.name.endsWith(".ts") ||
                  file.name.endsWith(".py")
                ? "code"
                : "document",
              size: file.size,
            };
          });

          attachmentsList = await Promise.all(uploadPromises);

          toast({
            title: "Files uploaded successfully",
            description: `${attachments.length} files have been uploaded.`,
            variant: "default",
          });
        } catch (uploadError: any) {
          console.error("Error uploading attachments:", uploadError);
          toast({
            title: "File Upload Error",
            description:
              "Some files could not be uploaded. Your post will be created without them.",
            variant: "destructive",
          });
        }
      }

      // Create the post object with all necessary fields
      const newPost = {
        author: {
          id: user.uid!,
          name: user.displayName!,
          avatar: user.photoURL!,
        },
        likes: 0,
        comments: [],
        views: 0,
        title,
        content,
        preview,
        category: category as Post["category"], // Cast to the correct type
        tags,
        type: "discussion" as const,
        status: "published" as const,
        isPinned: false,
        isHot: false,
        attachments: attachmentsList,
        score: 0,
        trending: 0,
        meta: {
          description: preview,
          keywords: tags,
        },
        createdAt: new Date(),
      };

      // Create the post in the database
      await createPost(newPost);

      toast({
        title: "Success",
        description: "Your discussion has been created successfully.",
      });

      // Reset form and close modal
      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to create discussion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create New Discussion
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for your discussion"
              className="w-full"
              required
            />
          </div>

          {/* Category Select Component */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name} ({cat.count})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem key="general" value="General">
                    General
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Content <span className="text-red-500">*</span>
            </Label>
            <div className="min-h-[200px] border rounded-md overflow-hidden">
              <TipTapEditor
                value={content}
                onChange={setContent}
                placeholder="Write your discussion details here..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Tags <span className="text-xs text-slate-500">(up to 5)</span>
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 rounded-full p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Enter a tag"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 5}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Attachments{" "}
              <span className="text-xs text-slate-500">
                (optional, up to 5 files)
              </span>
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((file, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-1 max-w-full"
                >
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="ml-1 rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachments.length >= 5}
                className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950 dark:hover:text-purple-300"
              >
                <Paperclip className="h-4 w-4 mr-1" />
                Add Files
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachments.length >= 5}
                className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950 dark:hover:text-purple-300"
              >
                <Image className="h-4 w-4 mr-1" />
                Add Images
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading || !title.trim() || !content.trim() || !category
              }
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {loading ? "Posting..." : "Post Discussion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}