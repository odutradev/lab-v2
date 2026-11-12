import { Box, alpha } from "@mantine/core";

import ToastContainer from "@components/toast";
import Navbar from "@components/navbar";
import useAuthStore from "@stores/auth";

import type { AppLayoutProps } from "@routes/components/appLayout/types";
import { colors } from "@styles/theme";

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: colors.night900,
        backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, ${alpha(colors.indigo500, 0.18)}, transparent 70%), radial-gradient(ellipse 60% 40% at 90% 80%, ${alpha(colors.cyan500, 0.1)}, transparent 60%)`,
        backgroundAttachment: "fixed"
      }}
    >
      {isAuthenticated && <Navbar />}
      {children}
      <ToastContainer />
    </Box>
  );
};

export default AppLayout;
