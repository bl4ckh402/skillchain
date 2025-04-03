"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserRole } from '@/types/user';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: (UserRole | string)[];
  fallbackPath?: string;
  displayMessage?: boolean;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = '/',
  displayMessage = true
}: RoleGuardProps) {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      if (authLoading) return; // Wait for auth to initialize
      
      if (!user) {
        // Redirect to login if not signed in
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      
      try {
        // Get fresh user data from Firestore to ensure roles are up-to-date
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = userData.role || 'student'; // Default to student if no role specified
          
          // Check if user role is in allowed roles
          const hasAllowedRole = allowedRoles.includes(userRole);
          setHasPermission(hasAllowedRole);
          
          // Redirect if no permission and not showing message
          if (!hasAllowedRole && !displayMessage) {
            router.push(fallbackPath);
          }
        } else {
          // User document not found, redirect
          if (!displayMessage) {
            router.push(fallbackPath);
          }
          setHasPermission(false);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setHasPermission(false);
        
        if (!displayMessage) {
          router.push(fallbackPath);
        }
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user, authLoading, allowedRoles, router, fallbackPath, displayMessage]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission && displayMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <CardTitle className="text-center text-red-600 dark:text-red-400">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              This area requires {allowedRoles.join(" or ")} privileges.
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact an administrator if you believe you should have access.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push(fallbackPath)}>
              Return to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}