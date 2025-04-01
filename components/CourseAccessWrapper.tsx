"use client";

import { useState, useEffect } from "react";
import { CourseAccessGuard } from "@/components/CourseAccessGuard";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

interface CourseAccessWrapperProps {
  children: React.ReactNode;
}

export default function CourseAccessWrapper({ children }: CourseAccessWrapperProps) {
  const params = useParams<{ id: string; lessonid?: string }>();
  const [courseData, setCourseData] = useState<{
    title: string;
    price: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!params.id) {
        setError("Course ID not found");
        setLoading(false);
        return;
      }

      try {
        const courseRef = doc(db, "courses", params.id);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const data = courseSnap.data();
          setCourseData({
            title: data.title || "Untitled Course",
            price: data.price || 0,
          });
        } else {
          setError("Course not found");
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading course data...</span>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-muted-foreground">{error || "Failed to load course"}</p>
        </div>
      </div>
    );
  }

  return (
    <CourseAccessGuard
      courseId={params.id}
      courseTitle={courseData.title}
      coursePrice={courseData.price}
    >
      {children}
    </CourseAccessGuard>
  );
}