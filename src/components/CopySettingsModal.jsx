import { useState } from "react";
import { Modal, Stack, Box, Text, Select, Group, Button } from "@mantine/core";
import { X, ChevronDown } from "lucide-react";
import { useI18n } from "../i18n";

const actionButton = { h: 32, px: 16, fw: 400, radius: "md" };

export default function CopySettingsModal({ opened, source, targets, onClose, onCopy }) {
  const { t } = useI18n();
  const [target, setTarget] = useState(null);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      onExitTransitionEnd={() => setTarget(null)}
      centered
      size={420}
      radius={16}
      shadow="sm"
      title={t("copyTitle")}
      overlayProps={{ color: "#000", backgroundOpacity: 0.5 }}
      closeButtonProps={{ icon: <X size={16} />, size: "sm", "aria-label": t("cancel") }}
      styles={{
        content: { padding: "16px 24px" },
        header: { padding: 0, minHeight: 0, marginBottom: 12 },
        title: { fontSize: 16, lineHeight: "24px", fontWeight: 400 },
        body: { padding: 0 },
      }}
    >
      <Stack gap={12}>
        <Box bg="var(--mantine-color-gray-light)" px={12} py={8} style={{ borderRadius: 8 }}>
          <Text fz="sm" lh="20px" c="dimmed" truncate>
            {t("copySource")}
          </Text>
          <Text fz="sm" lh="20px" className="du-text-default" truncate>
            {source}
          </Text>
        </Box>

        <Select
          label={t("year")}
          description={t("copyTargetDesc")}
          placeholder={t("notSelected")}
          data={targets}
          value={target}
          onChange={setTarget}
          radius="md"
          rightSection={<ChevronDown size={16} />}
          rightSectionPointerEvents="none"
          allowDeselect={false}
          comboboxProps={{ withinPortal: true }}
        />

        <Group gap={8} justify="flex-end">
          <Button variant="subtle" {...actionButton} onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button {...actionButton} disabled={!target} onClick={() => onCopy(source, target)}>
            {t("copy")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
