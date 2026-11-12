import { Navigate } from "react-router-dom";

import useAuthStore from "@stores/auth";

import type { PublicRouteProps } from "@routes/components/publicRoute/types";

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
