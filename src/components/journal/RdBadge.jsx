import { Tooltip, UnstyledButton, Text, Stack } from "@mantine/core";
import { CircleCheck, CircleX, CircleHelp, PencilLine } from "lucide-react";
import { useI18n } from "../../i18n";
import { useAdmissionText, useFormat } from "../../journal/useJournal";

const STATUS = {
  ok: { icon: CircleCheck, color: "teal" },
  fail: { icon: CircleX, color: "red" },
  unknown: { icon: CircleHelp, color: "gray" },
};

/**
 * RD value styled by admission status; explanation on hover/focus, never colour alone.
 * variant "cell": the table cell carries the fill, the badge adds icon + value only.
 */
export default function RdBadge({ row, rules, size = "sm", variant = "badge" }) {
  const { t } = useI18n();
  const fmt = useFormat();
  const admissionText = useAdmissionText(rules);
  const { title, reasons } = admissionText(row.admission);
  const { icon: Icon, color } = STATUS[row.admission.status];
  const value = fmt(row.rd, rules.pRd);
  const lg = size === "lg";

  const label = (
    <Stack gap={4}>
      <Text fz="sm" fw={600}>
        {title}
      </Text>
      {reasons.map((r) => (
        <Text key={r} fz="sm" pl={12} style={{ textIndent: -12 }}>
          • {r}
        </Text>
      ))}
      {row.rdIsManual && <Text fz="xs">{t("rdManualNote")(fmt(row.rdAuto, rules.pRd))}</Text>}
    </Stack>
  );

  return (
    <Tooltip label={label} multiline w={300} withArrow events={{ hover: true, focus: true, touch: true }}>
      <UnstyledButton
        className="du-rd-badge"
        data-status={row.admission.status}
        aria-label={[`${t("rdFull")}: ${value}`, title, ...reasons, row.rdIsManual ? t("rdManualNote")(fmt(row.rdAuto, rules.pRd)) : null]
          .filter(Boolean)
          .join(". ")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: lg ? 6 : 4,
          padding: lg ? "4px 10px" : "2px 6px",
          borderRadius: 6,
          fontSize: lg ? 20 : 14,
          lineHeight: lg ? "28px" : "20px",
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          background: variant === "cell" ? "transparent" : `var(--mantine-color-${color}-light)`,
          color: variant === "cell" || color === "gray" ? "var(--mantine-color-text)" : `var(--mantine-color-${color}-light-color)`,
        }}
      >
        <Icon
          size={lg ? 20 : 14}
          aria-hidden="true"
          color={variant === "cell" && color !== "gray" ? `var(--mantine-color-${color}-light-color)` : undefined}
        />
        {value}
        {row.rdIsManual && <PencilLine size={lg ? 16 : 12} aria-hidden="true" />}
      </UnstyledButton>
    </Tooltip>
  );
}
