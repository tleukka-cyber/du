import { useState } from "react";
import { Paper, Stack, Title, Text, TextInput, PasswordInput, Button, Alert } from "@mantine/core";
import { Eye, EyeOff } from "lucide-react";
import { useI18n } from "../i18n";
import Logo from "./Logo";

const emptyErrors = { login: false, pass: false, alert: false };

export default function AuthScreen({ onLogin }) {
  const { t } = useI18n();
  const [login, setLogin] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(emptyErrors);

  const reset = () => setErrors(emptyErrors);

  const handleSubmit = (e) => {
    e.preventDefault();
    const l = login.trim();
    const p = pass;
    reset();

    if (!l || !p) {
      setErrors({ login: !l ? "emptyLogin" : false, pass: !p ? "emptyPass" : false, alert: false });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const okLogin = l === "admin";
      const okPass = p === "admin123";
      if (okLogin && okPass) {
        onLogin();
        return;
      }
      if (!okLogin && !okPass) setErrors({ login: true, pass: true, alert: true });
      else if (!okLogin) setErrors({ login: "errLogin", pass: false, alert: false });
      else setErrors({ login: false, pass: "errPass", alert: false });
    }, 600);
  };

  const fieldError = (v) => (typeof v === "string" ? t(v) : v);

  return (
    <div className="du-auth-bg" style={{ minHeight: "100%", display: "grid", placeItems: "center", padding: 16 }}>
      <Paper component="main" radius="lg" shadow="md" w={317} p="24px 16px" withBorder={false}>
        <Stack align="center" gap="24px">
          <Logo />
          <Stack align="center" gap={4} w="100%">
            <Title order={1} style={{ fontSize: 20, lineHeight: "24px", fontWeight: 700, margin: 0, textAlign: "center" }}>
              {t("welcome")}
            </Title>
            <Text ta="center" m={0}>
              {t("enterBoth")}
            </Text>
          </Stack>
          <Stack component="form" onSubmit={handleSubmit} align="center" gap="24px" w="100%" noValidate>
            <Stack gap="16px" w="100%">
              {errors.alert && (
                <Alert color="red" radius="md" py={8} px={12} styles={{ message: { fontSize: 12, lineHeight: "16px" } }}>
                  {t("errBoth")}
                </Alert>
              )}
              <TextInput
                radius="md"
                placeholder={t("loginPh")}
                aria-label="Логин"
                autoComplete="username"
                value={login}
                onChange={(e) => {
                  setLogin(e.target.value);
                  setErrors((prev) => ({ ...prev, login: false, alert: false }));
                }}
                error={fieldError(errors.login)}
              />
              <PasswordInput
                radius="md"
                placeholder={t("passPh")}
                aria-label="Пароль"
                autoComplete="current-password"
                value={pass}
                onChange={(e) => {
                  setPass(e.target.value);
                  setErrors((prev) => ({ ...prev, pass: false, alert: false }));
                }}
                error={fieldError(errors.pass)}
                visibilityToggleIcon={({ reveal }) =>
                  reveal ? <EyeOff size={16} /> : <Eye size={16} />
                }
              />
            </Stack>
            <Button type="submit" w={120} h={44} loading={loading}>
              {t("signin")}
            </Button>
          </Stack>
          <Button variant="subtle" size="sm" mt={-8} onClick={onLogin}>
            {t("demo")}
          </Button>
        </Stack>
      </Paper>
    </div>
  );
}
