import { Box, Text } from "@mantine/core";
import { useI18n } from "../i18n";

export default function JournalView() {
  const { t } = useI18n();
  return (
    <Box bg="var(--mantine-color-default)" style={{ borderRadius: 8 }} p="48px 16px" ta="center" c="dimmed">
      <Text fw={700} size="lg" c="var(--mantine-color-text)" mb={4}>
        {t("soonT")}
      </Text>
      <Text>{t("soonD")}</Text>
    </Box>
  );
}
