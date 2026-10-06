import { Alert, Button, Group, Loader, Text } from "@mantine/core";
import { RefreshCw, TriangleAlert, Info } from "lucide-react";
import { useI18n } from "../../i18n";

/** Loading / error / empty / loaded states of the daily-grades request. */
export default function DailyStatus({ daily }) {
  const { t, lang } = useI18n();
  const time = (d) => d?.toLocaleTimeString(lang === "en" ? "en-US" : "ru-RU", { hour: "2-digit", minute: "2-digit" }) ?? "";

  if (daily.status === "loading") {
    return (
      <Group gap={12} justify="center" py={48} role="status">
        <Loader size="sm" />
        <Text c="dimmed">{t("dailyLoading")}</Text>
      </Group>
    );
  }
  if (daily.status === "error") {
    return (
      <Alert color="red" radius="md" icon={<TriangleAlert size={18} />} title={t("dailyErrorT")} role="alert">
        <Text fz="sm" mb={12}>
          {t("dailyErrorD")}
        </Text>
        <Button size="xs" radius="md" variant="white" color="red" leftSection={<RefreshCw size={14} />} onClick={daily.retry}>
          {t("retry")}
        </Button>
      </Alert>
    );
  }
  if (daily.status === "empty") {
    return (
      <Alert color="gray" radius="md" icon={<Info size={18} />} title={t("dailyEmptyT")}>
        {t("dailyEmptyD")}
      </Alert>
    );
  }
  return (
    <Text fz="xs" c="dimmed" role="status">
      {t("dailyLoaded")(daily.columns.length, time(daily.loadedAt))}
    </Text>
  );
}
