import { Box } from "@mantine/core";

import ToastContainer from "@components/toast";
import Navbar from "@components/navbar";
import useAuthStore from "@stores/auth";

import type { AppLayoutProps } from "@routes/components/appLayout/types";
import { tokens } from "@styles/theme";

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Box
      pb={isAuthenticated ? { base: 64, sm: 0 } : 0}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: tokens.background
      }}
    >
      <Navbar />
      {children}
      <ToastContainer />
    </Box>
  );
};

export default AppLayout;
