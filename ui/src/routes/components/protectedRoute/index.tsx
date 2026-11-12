import { Navigate } from "react-router-dom";

import useAuthStore from "@stores/auth";
import useSystemStore from "@stores/system";

import type { ProtectedRouteProps } from "@routes/components/protectedRoute/types";

export const ProtectedRoute = ({ children, requiredPermissions }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  const { hasPermissions } = useSystemStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasPermissions(requiredPermissions)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
