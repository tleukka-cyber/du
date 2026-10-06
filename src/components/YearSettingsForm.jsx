import { useState } from "react";
import { Box, Stack, Group, Text, Divider, NumberInput, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { BookmarkCheck, Calculator, Check } from "lucide-react";
import { useI18n } from "../i18n";

const SECTIONS = [
  {
    icon: BookmarkCheck,
    titleKey: "admission",
    fields: [
      { key: "admRating", hintKey: "range100", max: 100, decimal: true },
      { key: "admEach", hintKey: "range100", max: 100, decimal: true },
      { key: "admAttendance", hintKey: "range100", max: 100, decimal: true },
    ],
  },
  {
    icon: Calculator,
    titleKey: "precision",
    fields: [
      { key: "precRating", hintKey: "range5", max: 5, decimal: false },
      { key: "precExam", hintKey: "range5", max: 5, decimal: false },
      { key: "precGrade", hintKey: "range5", max: 5, decimal: false },
    ],
  },
];

const panelStyle = { borderRadius: 8 };

function SectionTitle({ icon: Icon, children }) {
  return (
    <Group gap={12} h={28} wrap="nowrap">
      <Group gap={8} wrap="nowrap">
        <Icon size={24} color="var(--mantine-color-brand-6)" style={{ flex: "none" }} />
        <Text fz={18} lh="28px" fw={600}>
          {children}
        </Text>
      </Group>
      <Divider style={{ flex: 1 }} />
    </Group>
  );
}

export default function YearSettingsForm({ initialValues, onSave }) {
  const { t } = useI18n();
  const [values, setValues] = useState(initialValues);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(values);
    notifications.show({
      message: t("saved"),
      icon: <Check size={14} strokeWidth={3} />,
      color: "teal",
      radius: "md",
      autoClose: 2600,
    });
  };

  return (
    <Stack component="form" onSubmit={handleSubmit} gap="16px">
      <Box bg="var(--mantine-color-default)" style={panelStyle} p="16px">
        <Stack gap="24px">
          {SECTIONS.map(({ icon, titleKey, fields }) => (
            <Stack key={titleKey} gap="16px">
              <SectionTitle icon={icon}>{t(titleKey)}</SectionTitle>
              {fields.map(({ key, hintKey, max, decimal }) => (
                <NumberInput
                  key={key}
                  label={t(key)}
                  description={t(hintKey)}
                  placeholder="0"
                  min={0}
                  max={max}
                  clampBehavior="strict"
                  allowNegative={false}
                  allowDecimal={decimal}
                  decimalScale={decimal ? 2 : 0}
                  radius="md"
                  value={values[key] ?? ""}
                  onChange={(v) => setValues((prev) => ({ ...prev, [key]: v }))}
                  styles={{ wrapper: { width: 100 } }}
                />
              ))}
            </Stack>
          ))}
        </Stack>
      </Box>

      <Group bg="var(--mantine-color-default)" style={panelStyle} p="16px" h={64} justify="flex-end">
        <Button type="submit" radius="md" h={32} px={16} fw={400}>
          {t("save")}
        </Button>
      </Group>
    </Stack>
  );
}
