"use client";

import { RoleGuard } from '@/components/role-guard';
import InstructorDashboardContent from '@/components/DashboardContent';

export default function InstructorDashboardPage() {
  return (
    <RoleGuard allowedRoles={['instructor', 'admin']} fallbackPath="/">
      <InstructorDashboardContent />
    </RoleGuard>
  );
}