import { Group, ActionIcon, Menu, UnstyledButton, Avatar, Text, Box } from "@mantine/core";
import { Moon, Sun, Bell, ChevronDown } from "lucide-react";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { useI18n } from "../i18n";
import Logo from "./Logo";

const LANGS = [
  { code: "kz", label: "Қазақша" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
];

export default function TopBar({ onLogout }) {
  const { lang, setLang, t } = useI18n();
  const { setColorScheme } = useMantineColorScheme();
  const computedScheme = useComputedColorScheme("light");
  const isDark = computedScheme === "dark";

  return (
    <Group
      component="header"
      className="du-topbar"
      wrap="nowrap"
      mih={74}
      px="24px"
      py="12px"
      justify="space-between"
      bg="var(--mantine-color-body)"
      style={{
        borderBottom: "1px solid var(--mantine-color-default-border)",
        position: "sticky",
        top: 0,
        zIndex: 20,
        flex: "none",
      }}
    >
      <Logo height={40} width={95} />
      <Group className="du-actions" gap="16px" wrap="nowrap">
        <Menu shadow="md" radius="md" position="bottom-end" offset={8}>
          <Menu.Target>
            <ActionIcon variant="default" radius="md" size={36} aria-label="Язык">
              {lang.toUpperCase()}
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown miw={180}>
            {LANGS.map(({ code, label }) => (
              <Menu.Item
                key={code}
                onClick={() => setLang(code)}
                c={lang === code ? "brand.6" : undefined}
              >
                {label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        <ActionIcon
          variant="default"
          radius="md"
          size={36}
          aria-label={isDark ? "Светлая тема" : "Тёмная тема"}
          onClick={() => setColorScheme(isDark ? "light" : "dark")}
        >
          {isDark ? <Sun size={24} strokeWidth={1.5} /> : <Moon size={24} strokeWidth={1.5} />}
        </ActionIcon>

        <Menu shadow="md" radius="md" position="bottom-end" offset={8}>
          <Menu.Target>
            <ActionIcon variant="light" color="brand" radius="md" size={36} aria-label="Уведомления">
              <Bell size={24} strokeWidth={1.5} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown miw={220}>
            <Box p="12px" c="dimmed" fz={12} lh="16px">
              {t("noNotif")}
            </Box>
          </Menu.Dropdown>
        </Menu>

        <Menu shadow="md" radius="md" position="bottom-end" offset={8}>
          <Menu.Target>
            <UnstyledButton
              className="du-user"
              w={250}
              h={36}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
            >
              <Group gap="8px" wrap="nowrap" style={{ minWidth: 0 }}>
                <Avatar radius={64} color="brand" variant="light" size={36} style={{ fontWeight: 600, fontSize: 13, flex: "none" }}>
                  AD
                </Avatar>
                <Box className="du-user-text" style={{ minWidth: 0 }}>
                  <Text size="sm" truncate>
                    231900@astanait.edu.kz
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t("employee")}
                  </Text>
                </Box>
              </Group>
              <ChevronDown size={16} style={{ flex: "none" }} />
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown miw={180}>
            <Menu.Item onClick={onLogout}>{t("logout")}</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
