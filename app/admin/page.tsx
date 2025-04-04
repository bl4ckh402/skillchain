// app/admin/page.tsx
"use client";

import { RoleGuard } from '@/components/role-guard';
import AdminDashboardContent from '@/components/admin/DashBoardContent';

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['admin']} fallbackPath="/">
      <AdminDashboardContent />
    </RoleGuard>
  );
}