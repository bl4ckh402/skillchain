"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function EditBlogPage() {
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchBlog() {
      if (!id) return;
      setLoading(true);
      const docRef = doc(db, "blogs", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBlog({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    }
    fetchBlog();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !blog) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "blogs", id as string), {
        title: blog.title,
        content: blog.content,
        imageUrl: blog.imageUrl,
      });
      toast({ title: "Blog updated" });
      router.push(`/blog/${id}`);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update blog",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;
  if (!blog) return <div>Blog not found.</div>;

  return (
    <div className="container max-w-2xl py-10 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Edit Blog</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <Input
          value={blog.title}
          onChange={(e) => setBlog({ ...blog, title: e.target.value })}
          placeholder="Title"
          required
        />
        <Input
          value={blog.imageUrl || ""}
          onChange={(e) => setBlog({ ...blog, imageUrl: e.target.value })}
          placeholder="Image URL"
        />
        <textarea
          value={blog.content}
          onChange={(e) => setBlog({ ...blog, content: e.target.value })}
          placeholder="Content"
          className="w-full h-40 p-2 border rounded"
          required
        />
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </form>
    </div>
  );
}
