"use client";

import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, ChevronRight, MessageSquare, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Overview Section Component
type Course = {
  instructor?: {
    id?: string;
    name?: string;
    avatar?: string;
    bio?: string;
    title?: string;
    specialties?: string[];
  };
  whatYouWillLearn?: string[];
  requirements?: string[];
  longDescription?: string;
  description?: string;
};

export function CourseOverviewSection({ course }: { course: Course }) {
  const [instructorBio, setInstructorBio] = useState<string | null>(null);
  const [instructorStats, setInstructorStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    averageRating: 0,
    totalReviews: 0,
    loading: true,
  });
  const [profileBio, setProfileBio] = useState<string | null>(null);

  useEffect(() => {
    const fetchBio = async () => {
      if (course?.instructor?.bio) {
        setInstructorBio(course.instructor.bio);
      } else if (course?.instructor?.id) {
        const userRef = doc(db, "users", course.instructor.id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setInstructorBio(userSnap.data().bio || null);
        }
      }
    };
    fetchBio();
  }, [course?.instructor]);

  useEffect(() => {
    const fetchProfileBio = async () => {
      if (!course?.instructor?.id) return;
      try {
        const userRef = doc(db, "users", course.instructor.id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfileBio(userSnap.data().bio || null);
        }
      } catch (error) {
        setProfileBio(null);
      }
    };
    fetchProfileBio();
  }, [course?.instructor?.id]);

  if (!course?.instructor) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          What You'll Learn
        </h2>
        <div className="grid gap-3 mt-4 sm:grid-cols-2">
          {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 ? (
            course.whatYouWillLearn.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <ChevronRight className="w-5 h-5 text-teal-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  {item}
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-slate-500 dark:text-slate-400">
              No learning outcomes specified for this course.
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          Requirements
        </h2>
        <ul className="pl-5 mt-4 space-y-2 list-disc text-slate-700 dark:text-slate-300">
          {course.requirements && course.requirements.length > 0 ? (
            course.requirements.map((item, index) => (
              <li key={index}>{item}</li>
            ))
          ) : (
            <li className="text-slate-500 dark:text-slate-400">
              No specific requirements for this course.
            </li>
          )}
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
          Description
        </h2>
        <div className="mt-4 space-y-4 text-slate-700 dark:text-slate-300">
          {course.longDescription ? (
            <div
              dangerouslySetInnerHTML={{
                __html: course.longDescription.replace(/\n/g, "<br/>"),
              }}
            />
          ) : (
            <p>
              {course.description ||
                "No detailed description available for this course."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Instructor Section Component
export function CourseInstructorSection({ course }: { course: Course }) {
  const [instructorStats, setInstructorStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    averageRating: 0,
    totalReviews: 0,
    loading: true,
  });
  const [profileBio, setProfileBio] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructorStats = async () => {
      if (!course?.instructor?.id) return;

      try {
        // Fetch instructor stats from Firestore
        const statsRef = doc(db, "instructorStats", course.instructor.id);
        const statsSnap = await getDoc(statsRef);

        if (statsSnap.exists()) {
          const data = statsSnap.data();

          // Get instructor's courses to calculate average rating
          const coursesQuery = query(
            collection(db, "courses"),
            where("instructor.id", "==", course.instructor.id),
            limit(20)
          );

          const coursesSnap = await getDocs(coursesQuery);

          let totalRating = 0;
          let totalReviews = 0;
          let coursesWithRating = 0;

          coursesSnap.docs.forEach((doc) => {
            const courseData = doc.data();
            if (courseData.rating && courseData.rating > 0) {
              totalRating += courseData.rating;
              coursesWithRating++;
            }
            if (courseData.reviews) {
              totalReviews += courseData.reviews;
            }
          });

          const averageRating =
            coursesWithRating > 0 ? totalRating / coursesWithRating : 0;

          setInstructorStats({
            totalStudents: data.totalStudents || 0,
            totalCourses: data.totalCourses || coursesSnap.size,
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalReviews: totalReviews,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching instructor stats:", error);
        setInstructorStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchInstructorStats();
  }, [course?.instructor?.id]);

  useEffect(() => {
    const fetchProfileBio = async () => {
      if (!course?.instructor?.id) return;
      try {
        const userRef = doc(db, "users", course.instructor.id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfileBio(userSnap.data().bio || null);
        }
      } catch (error) {
        setProfileBio(null);
      }
    };
    fetchProfileBio();
  }, [course?.instructor?.id]);

  if (!course?.instructor) return null;

  return (
    <div className="flex flex-col items-start gap-6 md:flex-row">
      <Avatar className="w-24 h-24 border-4 border-blue-100 dark:border-blue-900">
        <AvatarImage
          src={course.instructor.avatar || "/images/default-avatar.png"}
          alt={course.instructor.name}
        />
        <AvatarFallback className="text-xl text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
          {course.instructor.name?.charAt(0) || "I"}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            {course.instructor.name || "Instructor"}
          </h2>
          <p className="text-blue-600 dark:text-blue-400">
            {course.instructor.title || "Blockchain Educator"}
          </p>
        </div>

        {!instructorStats.loading && (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {instructorStats.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{instructorStats.averageRating} Instructor Rating</span>
              </div>
            )}

            {instructorStats.totalReviews > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-teal-500" />
                <span>
                  {instructorStats.totalReviews.toLocaleString()} Reviews
                </span>
              </div>
            )}

            {instructorStats.totalStudents > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span>
                  {instructorStats.totalStudents.toLocaleString()} Students
                </span>
              </div>
            )}
          </div>
        )}

        <div className="text-slate-700 dark:text-slate-300">
          {profileBio ? (
            <div
              dangerouslySetInnerHTML={{
                __html: profileBio.replace(/\n/g, "<br/>"),
              }}
            />
          ) : (
            <p>No instructor bio available.</p>
          )}
        </div>

        {course.instructor.specialties && (
          <div>
            <p className="mb-1 font-medium text-slate-800 dark:text-slate-200">
              Specialties:
            </p>
            <div className="flex flex-wrap gap-2">
              {course.instructor.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900/50 dark:text-blue-300"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reviews Section Component
type CourseReviewsSectionProps = {
  courseId: string;
  initialRating?: number;
  initialReviews?: number;
};

export function CourseReviewsSection({
  courseId,
  initialRating = 0,
  initialReviews = 0,
}: CourseReviewsSectionProps) {
  const [reviewStats, setReviewStats] = useState({
    rating: initialRating,
    totalReviews: initialReviews,
    distribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
    loading: true,
  });

  type Review = {
    id: string;
    userAvatar?: string;
    userName?: string;
    rating?: number;
    text?: string;
    createdAt?: Date;
  };
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadMoreVisible, setLoadMoreVisible] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);

  // Fetch review statistics
  useEffect(() => {
    const fetchReviewStats = async () => {
      if (!courseId) return;

      try {
        // Fetch course details to get overall rating
        const courseDoc = await getDoc(doc(db, "courses", courseId));

        if (courseDoc.exists()) {
          const courseData = courseDoc.data();
          setReviewStats((prev) => ({
            ...prev,
            rating: courseData.rating || 0,
            totalReviews: courseData.reviews || 0,
          }));
        }

        // Count reviews for distribution
        const reviewsRef = collection(db, "reviews");
        const reviewsQuery = query(
          reviewsRef,
          where("courseId", "==", courseId)
        );

        const reviewsSnap = await getDocs(reviewsQuery);

        if (!reviewsSnap.empty) {
          // Calculate distribution
          const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

          reviewsSnap.docs.forEach((doc) => {
            const rating = doc.data().rating;
            if (rating >= 1 && rating <= 5) {
              distribution[rating]++;
            }
          });

          // Convert to percentages
          const total = reviewsSnap.size;
          Object.keys(distribution).forEach((key) => {
            const keyNum = key as keyof typeof distribution;
            distribution[keyNum] =
              total > 0 ? Math.round((distribution[keyNum] / total) * 100) : 0;
          });

          setReviewStats((prev) => ({
            ...prev,
            distribution,
            totalReviews: total,
            loading: false,
          }));
        } else {
          setReviewStats((prev) => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("Error fetching review stats:", error);
        setReviewStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchReviewStats();
  }, [courseId, initialRating, initialReviews]);

  // Fetch review items
  useEffect(() => {
    const fetchReviews = async () => {
      if (!courseId) return;

      try {
        const reviewsRef = collection(db, "reviews");
        const reviewsQuery = query(
          reviewsRef,
          where("courseId", "==", courseId),
          orderBy("createdAt", "desc"),
          limit(3)
        );

        const reviewsSnap = await getDocs(reviewsQuery);

        if (!reviewsSnap.empty) {
          const reviewData = reviewsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }));

          setReviews(reviewData);
          setLoadMoreVisible(reviewsSnap.size >= 3);
          setLastVisible(reviewsSnap.docs[reviewsSnap.docs.length - 1]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [courseId]);

  const handleLoadMore = async () => {
    if (!courseId || !lastVisible) return;

    try {
      setLoadingReviews(true);

      const reviewsRef = collection(db, "reviews");
      const reviewsQuery = query(
        reviewsRef,
        where("courseId", "==", courseId),
        orderBy("createdAt", "desc"),
        limit(3),
        startAfter(lastVisible)
      );

      const reviewsSnap = await getDocs(reviewsQuery);

      if (!reviewsSnap.empty) {
        const newReviews = reviewsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        setReviews((prev) => [...prev, ...newReviews]);
        setLoadMoreVisible(reviewsSnap.size >= 3);
        setLastVisible(reviewsSnap.docs[reviewsSnap.docs.length - 1]);
      } else {
        setLoadMoreVisible(false);
      }
    } catch (error) {
      console.error("Error loading more reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
        Student Reviews
      </h2>

      <div className="flex flex-col gap-8 mt-4 md:flex-row">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="text-5xl font-bold text-slate-800 dark:text-slate-200">
            {reviewStats.rating ? reviewStats.rating.toFixed(1) : "0.0"}
          </div>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(reviewStats.rating)
                    ? "fill-amber-500 text-amber-500"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {reviewStats.totalReviews > 0
              ? `${reviewStats.totalReviews} ${
                  reviewStats.totalReviews === 1 ? "review" : "reviews"
                }`
              : "No reviews yet"}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {!reviewStats.loading && (
            <div className="space-y-1">
              {Object.entries(reviewStats.distribution)
                .sort((a, b) => Number(b[0]) - Number(a[0])) // Sort 5 stars to 1 star
                .map(([stars, percentage]) => (
                  <div
                    key={stars}
                    className="flex items-center justify-between"
                  >
                    <div className="text-sm">{stars} stars</div>
                    <Progress
                      value={percentage}
                      className="h-2 w-full max-w-[300px] bg-slate-100 dark:bg-slate-800"
                      indicatorClassName="bg-amber-500"
                    />
                    <div className="text-sm text-muted-foreground">
                      {percentage}%
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        {loadingReviews ? (
          <div className="py-8 text-center text-slate-400">
            Loading reviews...
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="flex items-start gap-4">
                <Avatar className="w-10 h-10 border-2 border-blue-100 dark:border-blue-900">
                  {review.userAvatar ? (
                    <AvatarImage
                      src={review.userAvatar}
                      alt={review.userName}
                    />
                  ) : null}
                  <AvatarFallback className="text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                    {review.userName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-slate-800 dark:text-slate-200">
                      {review.userName || "Anonymous User"}
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      {review.createdAt &&
                        formatDistanceToNow(review.createdAt, {
                          addSuffix: true,
                        })}
                    </div>
                  </div>

                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < (review.rating || 0)
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-slate-700 dark:text-slate-300">
                    {review.text || "No comment provided."}
                  </p>
                </div>
              </div>
            ))}

            {loadMoreVisible && (
              <Button
                variant="outline"
                className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                onClick={handleLoadMore}
                disabled={loadingReviews}
              >
                {loadingReviews ? "Loading..." : "Load More Reviews"}
              </Button>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400">
            No reviews yet. Be the first to review this course!
          </div>
        )}
      </div>
    </div>
  );
}
