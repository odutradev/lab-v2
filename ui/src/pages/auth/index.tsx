import { Box, Group, Text, Anchor } from "@mantine/core";
import { Link } from "react-router-dom";

import ResetPasswordForm from "@components/resetPasswordForm";
import Card, { CardContent } from "@components/card";
import AuthHeader from "./subcomponents/authHeader";
import AuthTabs from "./subcomponents/authTabs";
import LoginForm from "./subcomponents/loginForm";
import RegisterForm from "./subcomponents/registerForm";
import { containerStyle } from "./styles";
import useAuthPage from "./hook";

export const AuthPage = () => {
  const { authMode, title, subtitle, isResetMode, handleModeChange, goToLogin, goToReset } = useAuthPage();

  return (
    <Box w="100%" style={containerStyle}>
      <AuthHeader title={title} subtitle={subtitle} isResetMode={isResetMode} />

      <Card>
        <CardContent>
          {isResetMode ? (
            <ResetPasswordForm onSuccess={goToLogin} onCancel={goToLogin} />
          ) : (
            <>
              <AuthTabs value={authMode} onChange={handleModeChange} />

              {authMode === "login" ? <LoginForm onForgotPassword={goToReset} /> : <RegisterForm />}
            </>
          )}
        </CardContent>
      </Card>

      <Group justify="center" gap="sm" mt="lg">
        <Anchor component={Link} to="/privacy" size="xs" c="dimmed">
          Política de Privacidade
        </Anchor>
        <Text size="xs" c="dimmed">
          •
        </Text>
        <Anchor component={Link} to="/terms" size="xs" c="dimmed">
          Termos de Serviço
        </Anchor>
      </Group>
    </Box>
  );
};

export default AuthPage;
