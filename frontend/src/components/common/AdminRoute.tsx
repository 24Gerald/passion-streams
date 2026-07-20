import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
// import type { UserRole } from '@/shared/types';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Check if we're already on admin login page
  if (location.pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
