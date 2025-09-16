"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteDoc, doc as firestoreDoc } from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function BlogDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteDoc(firestoreDoc(db, "blogs", id as string));
      toast({ title: "Blog deleted" });
      router.push("/blog");
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive",
      });
    }
    setDeleting(false);
  };

  if (loading) return <div>Loading...</div>;
  if (!blog) return <div>Blog not found.</div>;

  // TODO: Replace this with the actual user profile fetching logic
  const userProfile = { role: "admin" };
  const isAdmin = userProfile?.role === "admin";

  return (
    <div className="container max-w-2xl py-10 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{blog.title}</CardTitle>
          <div className="text-xs text-muted-foreground">
            By {blog.author} •{" "}
            {blog.date
              ? typeof blog.date === "object" && "toDate" in blog.date
                ? blog.date.toDate().toLocaleDateString()
                : new Date(blog.date).toLocaleDateString()
              : ""}
          </div>

          {isAdmin && (
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/blog/${id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {blog.imageUrl && (
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="object-cover w-full mb-4 rounded max-h-64"
            />
          )}
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
