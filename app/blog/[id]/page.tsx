"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BlogDetailsPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading...</div>;
  if (!blog) return <div>Blog not found.</div>;

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
