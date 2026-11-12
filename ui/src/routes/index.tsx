import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { lazy, Suspense } from "react";

import { ProtectedRoute, PublicRoute, AppLayout } from "./components";
import PageContainer from "@components/pageContainer";
import termsOfServiceMetadata from "@pages/termsOfService/metadata";
import privacyPolicyMetadata from "@pages/privacyPolicy/metadata";
import resetPasswordMetadata from "@pages/resetPassword/metadata";
import profileMetadata from "@pages/profile/metadata";
import workoutsMetadata from "@pages/workouts/metadata";
import nutritionMetadata from "@pages/nutrition/metadata";
import homeMetadata from "@pages/home/metadata";
import authMetadata from "@pages/auth/metadata";

import type { RouteItem } from "./types";

const HomePage = lazy(() => import("@pages/home"));
const ProfilePage = lazy(() => import("@pages/profile"));
const WorkoutsPage = lazy(() => import("@pages/workouts"));
const NutritionPage = lazy(() => import("@pages/nutrition"));
const AuthPage = lazy(() => import("@pages/auth"));
const ResetPasswordPage = lazy(() => import("@pages/resetPassword"));
const PrivacyPolicyPage = lazy(() => import("@pages/privacyPolicy"));
const TermsOfServicePage = lazy(() => import("@pages/termsOfService"));

const routes: RouteItem[] = [
  { path: "/", component: HomePage, metadata: homeMetadata },
  { path: "/profile", component: ProfilePage, metadata: profileMetadata },
  { path: "/workouts", component: WorkoutsPage, metadata: workoutsMetadata },
  { path: "/nutrition", component: NutritionPage, metadata: nutritionMetadata },
  { path: "/auth", component: AuthPage, metadata: authMetadata },
  { path: "/reset-password", component: ResetPasswordPage, metadata: resetPasswordMetadata },
  { path: "/privacy", component: PrivacyPolicyPage, metadata: privacyPolicyMetadata },
  { path: "/terms", component: TermsOfServicePage, metadata: termsOfServiceMetadata }
];

const pageFallback = (
  <Center h="60vh">
    <Loader color="indigo" size="lg" />
  </Center>
);

const renderRouteElement = ({ component: Component, metadata }: RouteItem) => {
  const content = (
    <PageContainer center={metadata.isCentered}>
      <Suspense fallback={pageFallback}>
        <Component />
      </Suspense>
    </PageContainer>
  );

  if (metadata.isPrivate) {
    return <ProtectedRoute requiredPermissions={metadata.requiredPermissions}>{content}</ProtectedRoute>;
  }

  if (metadata.isPublicOnly) {
    return <PublicRoute>{content}</PublicRoute>;
  }

  return content;
};

export const Router = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={renderRouteElement(route)} />
          ))}
          <Route path="/politica-de-privacidade" element={<Navigate to="/privacy" replace />} />
          <Route path="/termos-de-servico" element={<Navigate to="/terms" replace />} />
          <Route path="/habits" element={<Navigate to="/" replace />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default Router;
