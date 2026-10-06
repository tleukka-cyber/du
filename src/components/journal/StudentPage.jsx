import { Box, Stack, Group, Text, Button, SimpleGrid, Paper, Alert, List, Table } from "@mantine/core";
import { ArrowLeft, CircleCheck, CircleX, CircleHelp } from "lucide-react";
import { useI18n } from "../../i18n";
import { useJournal, useFormat, useAdmissionText } from "../../journal/useJournal";
import { columnLabels, hasAdmissionRules } from "../../journal/calc";
import PageHeader from "../PageHeader";
import DailyStatus from "./DailyStatus";
import RdBadge from "./RdBadge";

const ADMISSION_ALERT = {
  ok: { color: "teal", icon: CircleCheck },
  fail: { color: "red", icon: CircleX },
  unknown: { color: "gray", icon: CircleHelp },
};

function Stat({ label, children, note }) {
  return (
    <Paper withBorder radius="md" p="12px" bg="var(--mantine-color-body)">
      <Text fz="xs" c="dimmed" lh="16px" mb={4}>
        {label}
      </Text>
      <Box fz={20} lh="28px" fw={600} style={{ fontVariantNumeric: "tabular-nums" }}>
        {children}
      </Box>
      {note && (
        <Text fz="xs" c="dimmed" lh="16px" mt={4}>
          {note}
        </Text>
      )}
    </Paper>
  );
}

export default function StudentPage({ journal, studentId, onBackToList, onBackToJournal }) {
  const { t } = useI18n();
  const fmt = useFormat();
  const { daily, rules, rows, ready } = useJournal(journal);
  const admissionText = useAdmissionText(rules);
  const row = rows.find((r) => r.student.id === studentId);
  const { student } = row;
  const labels = columnLabels(daily.columns);

  const header = (
    <PageHeader
      crumbs={[
        { label: t("journal"), onClick: onBackToList },
        { label: journal.code, onClick: onBackToJournal },
        { label: student.name },
      ]}
      eyebrow={journal.discipline}
      title={student.name}
      meta={[
        { label: t("colGroup"), value: student.group },
        { label: t("colDiscipline"), value: journal.discipline },
        { label: t("colStream"), value: journal.stream },
        { label: t("year"), value: journal.year },
        { label: t("colPeriod"), value: t("periodN")(journal.period) },
      ]}
      actions={
        <Button variant="default" radius="md" leftSection={<ArrowLeft size={16} />} onClick={onBackToJournal}>
          {t("backToJournal")}
        </Button>
      }
    />
  );

  if (!ready) {
    return (
      <>
        {header}
        <Box bg="var(--mantine-color-default)" style={{ borderRadius: 8 }} p="16px">
          <DailyStatus daily={daily} />
        </Box>
      </>
    );
  }

  const adm = admissionText(row.admission);
  const { color, icon: AdmIcon } = ADMISSION_ALERT[row.admission.status];

  return (
    <>
      {header}

      <Box bg="var(--mantine-color-default)" style={{ borderRadius: 8 }} p="16px">
        <Stack gap="16px">
          <Text fw={600} fz={18} lh="28px">
            {t("totals")}
          </Text>
          <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="12px">
            <Stat label={t("rk1Full")}>{fmt(row.scores.rk1)}</Stat>
            <Stat label={t("rk2Full")}>{fmt(row.scores.rk2)}</Stat>
            <Stat
              label={t("rdFull")}
              note={row.rdIsManual ? t("rdManualExplain")(fmt(row.rdAuto, rules.pRd)) : row.itemsCount ? t("rdAutoExplain")(row.itemsCount) : null}
            >
              <RdBadge row={row} rules={rules} size="lg" />
            </Stat>
            <Stat label={t("ikFull")}>{fmt(row.ik, rules.pIk)}</Stat>
            <Stat label={t("ioFull")} note={row.io == null ? (row.rd == null ? t("ioNoRd") : t("ioNoIk")) : null}>
              {fmt(row.io, rules.pIo)}
            </Stat>
            <Stat label={t("attFull")}>{student.attendance == null ? "—" : `${fmt(student.attendance)}%`}</Stat>
          </SimpleGrid>

          <Alert color={color} radius="md" icon={<AdmIcon size={18} />} title={adm.title} aria-label={t("admissionTitle")}>
            {adm.reasons.length > 0 && (
              <List size="sm" spacing={2} mb={8}>
                {adm.reasons.map((r) => (
                  <List.Item key={r}>{r}</List.Item>
                ))}
              </List>
            )}
            {hasAdmissionRules(rules) && (
              <Text fz="xs" c="dimmed">
                {t("thresholds")(fmt(rules.minRd), fmt(rules.minRk), fmt(rules.minAtt))}
              </Text>
            )}
          </Alert>
        </Stack>
      </Box>

      <Box bg="var(--mantine-color-default)" style={{ borderRadius: 8 }} p="16px">
        <Stack gap="12px">
          <Group justify="space-between" gap={8}>
            <Text fw={600} fz={18} lh="28px">
              {t("dailyGrades")}
            </Text>
            <Text fz="xs" c="dimmed">
              {t("moodleSource")}
            </Text>
          </Group>
          <DailyStatus daily={daily} />
          {daily.columns.length > 0 && (
            <Table verticalSpacing={8} maw={480} style={{ background: "var(--mantine-color-body)" }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t("colDate")}</Table.Th>
                  <Table.Th ta="right">{t("colScore")}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {daily.columns.map((c, i) => {
                  const l = labels[c.id];
                  const v = row.dailyValues[i];
                  return (
                    <Table.Tr key={c.id}>
                      <Table.Td>
                        {l.date}
                        {l.of > 1 && (
                          <Text span c="dimmed" fz="xs" ml={8}>
                            {t("gradeOf")(l.n, l.of, l.time)}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td ta="right" c={v == null ? "dimmed" : undefined} style={{ fontVariantNumeric: "tabular-nums" }}>
                        {fmt(v)}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Box>
    </>
  );
}
