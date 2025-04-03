"use client";

import { RoleGuard } from '@/components/role-guard';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['instructor', 'admin']} fallbackPath="/">
      {children}
    </RoleGuard>
  );
}
