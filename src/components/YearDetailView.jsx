import { Box, Text, Group, UnstyledButton } from "@mantine/core";
import { useI18n } from "../i18n";

export default function YearDetailView({ year, onBack }) {
  const { t } = useI18n();
  return (
    <>
      <Group gap={8} c="dimmed" fz="sm">
        <UnstyledButton c="brand.6" onClick={onBack}>
          {t("settings")}
        </UnstyledButton>
        <span>/</span>
        <span>{year}</span>
      </Group>
      <Box bg="var(--mantine-color-default)" style={{ borderRadius: 8 }} p="16px">
        <Text>{t("yearSoon")}</Text>
      </Box>
    </>
  );
}
