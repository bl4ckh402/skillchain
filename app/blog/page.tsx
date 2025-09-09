"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthProvider";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Footer } from "@/components/footer";
interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  date: Timestamp | string;
  imageUrl?: string;
}

export default function BlogPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = userProfile?.role === "admin";
  const [image, setImage] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!image || !user?.uid) return "";
    setImageUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `${user.uid}-blog-${timestamp}-${image.name}`;
      const storageRef = ref(storage, `blog-images/${user.uid}/${fileName}`);
      await uploadBytes(storageRef, image);
      const imageUrl = await getDownloadURL(storageRef);
      setImageUploading(false);
      return imageUrl;
    } catch (error) {
      setImageUploading(false);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return "";
    }
  };

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      try {
        const q = query(collection(db, "blogs"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Blog[];
        setBlogs(data);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load blogs.",
          variant: "destructive",
        });
      }
      setLoading(false);
    }
    fetchBlogs();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;
    setSubmitting(true);

    try {
      let imageUrl = "";
      if (image) {
        imageUrl = await uploadImage();
      }

      const docRef = await addDoc(collection(db, "blogs"), {
        title: form.title,
        content: form.content,
        author: userProfile?.firstName
          ? `${userProfile.firstName} ${userProfile.lastName || ""}`.trim()
          : "Admin",
        date: Timestamp.now(),
        imageUrl,
      });

      setBlogs([
        {
          id: docRef.id,
          title: form.title,
          content: form.content,
          author: userProfile?.firstName
            ? `${userProfile.firstName} ${userProfile.lastName || ""}`.trim()
            : "Admin",
          date: new Date().toISOString(),
          imageUrl,
        },
        ...blogs,
      ]);

      setForm({ title: "", content: "" });
      setImage(null);
      toast({ title: "Blog published!" });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to publish blog.",
        variant: "destructive",
      });
    }
    setSubmitting(false);
  };

  return (

    <div className="w-full min-h-screen py-10 px-4 bg-white dark:bg-[#0a101a]">
      <h1 className="mb-6 text-3xl font-bold">SkillChain Blog</h1>
      <p className="mb-8 text-muted-foreground">
        Your trusted source for AI and Web3 insights, news, and
        tutorials—simplifying the future of technology for everyone
      </p>


        {authLoading ? (
          <div>Loading...</div>
        ) : isAdmin ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>New Blog Post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  name="title"
                  placeholder="Blog Title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500"
                />
                {image && (
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="object-cover w-full mb-2 rounded max-h-48"
                  />
                )}
                <div
                  className="
    rounded-lg border border-gray-200 dark:border-gray-700
    bg-white dark:bg-[#181f2a]
    text-gray-900 dark:text-gray-100
    p-2
   
  "

              >
                <CKEditor
                  editor={ClassicEditor}
                  data={form.content}
                  onChange={(_, editor) => {
                    const data = editor.getData();
                    setForm((prev) => ({ ...prev, content: data }));
                  }}
                />
              </div>
              <Button type="submit" disabled={submitting || imageUploading}>
                {submitting || imageUploading ? "Publishing..." : "Publish"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <div>Loading blogs...</div>
      ) : (
        <div className="grid gap-8-cols-1 sm:grid-cols-2 lg:grid-cols-3 ">
          {blogs.length === 0 && (
            <div className="text-muted-foreground">No blog posts yet.</div>
          )}
          {blogs.map((blog) => (
            <Card key={blog.id}>
              <CardHeader>
                <Link href={`/blog/${blog.id}`}>
                  <CardTitle className="text-green-600 cursor-pointer hover:underline">
                    {blog.title}
                  </CardTitle>
                </Link>
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
                </div>
                <Button type="submit" disabled={submitting || imageUploading}>
                  {submitting || imageUploading ? "Publishing..." : "Publish"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {loading ? (
          <div>Loading blogs...</div>
        ) : (
          <div className="grid grid-cols-1 gap-8- sm:grid-cols-2 lg:grid-cols-3 ">
            {blogs.length === 0 && (
              <div className="text-muted-foreground">No blog posts yet.</div>
            )}
            {blogs.map((blog) => (
              <Card key={blog.id}>
                <CardHeader>
                  <Link href={`/blog/${blog.id}`}>
                    <CardTitle className="text-green-600 cursor-pointer hover:underline">
                      {blog.title}
                    </CardTitle>
                  </Link>
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
                  <div className="mb-2 prose max-w-none">
                    {
                      // Show a preview of the content: first 30 words, plain text
                      blog.content
                        .replace(/(<([^>]+)>)/gi, "") // strip HTML tags
                        .split(" ")
                        .slice(0, 30)
                        .join(" ")
                    }
                    ...
                  </div>
                  <Link
                    href={`/blog/${blog.id}`}
                    className="text-sm font-medium text-green-600 hover:underline"
                  >
                    Continue Reading &rarr;
                  </Link>
                  {/* </Card>  dangerouslySetInnerHTML={{ __html: blog.content }} */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
