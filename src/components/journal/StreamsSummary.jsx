import { Stack, Text, Table, ScrollArea } from "@mantine/core";
import { useI18n } from "../../i18n";

/** Per-group summary of the journal: students and admission status counts. */
export default function StreamsSummary({ journal, rows }) {
  const { t } = useI18n();
  const byGroup = journal.groups.map((group) => {
    const members = rows.filter((r) => r.student.group === group);
    const count = (s) => members.filter((r) => r.admission.status === s).length;
    return { group, total: members.length, ok: count("ok"), fail: count("fail"), unknown: count("unknown") };
  });
  const sum = (k) => byGroup.reduce((n, g) => n + g[k], 0);

  return (
    <Stack gap="12px">
      <Text fz="sm" c="dimmed">
        {t("streamsHint")}
      </Text>
      <ScrollArea type="auto">
        <Table verticalSpacing="sm" miw={640} withTableBorder style={{ background: "var(--mantine-color-body)" }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("colStream")}</Table.Th>
              <Table.Th>{t("colGroup")}</Table.Th>
              <Table.Th ta="center">{t("colStudents")}</Table.Th>
              <Table.Th ta="center">{t("colAdmittedN")}</Table.Th>
              <Table.Th ta="center">{t("colNotAdmittedN")}</Table.Th>
              <Table.Th ta="center">{t("colUnknownN")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {byGroup.map((g) => (
              <Table.Tr key={g.group}>
                <Table.Td>{journal.stream}</Table.Td>
                <Table.Td>{g.group}</Table.Td>
                <Table.Td ta="center">{g.total}</Table.Td>
                <Table.Td ta="center">{g.ok}</Table.Td>
                <Table.Td ta="center">{g.fail}</Table.Td>
                <Table.Td ta="center">{g.unknown}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          <Table.Tfoot>
            <Table.Tr fw={600}>
              <Table.Td colSpan={2}>{journal.stream}</Table.Td>
              <Table.Td ta="center">{sum("total")}</Table.Td>
              <Table.Td ta="center">{sum("ok")}</Table.Td>
              <Table.Td ta="center">{sum("fail")}</Table.Td>
              <Table.Td ta="center">{sum("unknown")}</Table.Td>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </ScrollArea>
    </Stack>
  );
}
