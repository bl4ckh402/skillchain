"use client";

import { useAuth } from '@/context/AuthProvider';

export function useAuthRoles() {
  const { userProfile } = useAuth();
  
  return {
    isStudent: userProfile?.role === 'student',
    isInstructor: userProfile?.role === 'instructor',
    isAdmin: userProfile?.role === 'admin',
    hasRole: (roles: ('student' | 'instructor' | 'admin')[]) => 
      userProfile?.role ? roles.includes(userProfile.role) : false
  };
}