// components/admin/InstructorApplications.tsx
"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";

type Application = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  expertise: string;
  experienceLevel: string;
  experience: string;
  courseIdeas: string;
  motivation: string;
};

export default function InstructorApplications() {
  const { user, promoteToInstructor } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const applicationsQuery = query(
          collection(db, "instructorApplications"),
          where("status", "==", "pending")
        );

        const snapshot = await getDocs(applicationsQuery);

        const applicationsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Application, "id">),
        }));

        setApplications(applicationsList);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, []);

  const handleApproveApplication = async (
    applicationId: string,
    userId: string
  ) => {
    try {
      // Update application status
      await updateDoc(doc(db, "instructorApplications", applicationId), {
        status: "approved",
        reviewedAt: serverTimestamp(),
        reviewedBy: user?.uid,
        feedback: "Congratulations! Your application has been approved.",
      });

      // Promote user to instructor
      await promoteToInstructor(userId);

      // Update local state
      setApplications(applications.filter((app) => app.id !== applicationId));
    } catch (error) {
      console.error("Error approving application:", error);
      alert("Failed to approve application. Please try again.");
    }
  };

  const handleRejectApplication = async (
    applicationId: string,
    feedback: string
  ) => {
    try {
      await updateDoc(doc(db, "instructorApplications", applicationId), {
        status: "rejected",
        reviewedAt: serverTimestamp(),
        reviewedBy: user?.uid,
        feedback,
      });

      // Update local state
      setApplications(applications.filter((app) => app.id !== applicationId));
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert("Failed to reject application. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading applications...</div>;
  }

  if (applications.length === 0) {
    return <div>No pending instructor applications</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Pending Instructor Applications</h2>

      {applications.map((application) => (
        <div key={application.id} className="p-6 bg-white rounded shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">{application.fullName}</h3>
              <p className="text-gray-600">{application.email}</p>
            </div>
            <span className="px-3 py-1 text-sm text-yellow-800 bg-yellow-100 rounded-full">
              Pending
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-medium">Expertise</h4>
              <p>{application.expertise}</p>
            </div>
            <div>
              <h4 className="font-medium">Experience Level</h4>
              <p>{application.experienceLevel}</p>
            </div>
            <div className="col-span-2">
              <h4 className="font-medium">Experience</h4>
              <p>{application.experience}</p>
            </div>
            <div className="col-span-2">
              <h4 className="font-medium">Course Ideas</h4>
              <p>{application.courseIdeas}</p>
            </div>
            <div className="col-span-2">
              <h4 className="font-medium">Motivation</h4>
              <p>{application.motivation}</p>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button
              onClick={() =>
                handleRejectApplication(
                  application.id,
                  "Thank you for your application. At this time, we do not think your experience aligns with our current needs."
                )
              }
              className="px-4 py-2 text-red-500 border border-red-500 rounded hover:bg-red-50"
            >
              Reject
            </button>
            <button
              onClick={() =>
                handleApproveApplication(application.id, application.userId)
              }
              className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
            >
              Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
