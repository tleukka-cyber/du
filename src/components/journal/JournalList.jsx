import { useMemo } from "react";
import { Box, Stack, Group, Text, TextInput, Select, Button, Table, ScrollArea, Pagination, UnstyledButton } from "@mantine/core";
import { Search, FilterX, SearchX } from "lucide-react";
import { useI18n } from "../../i18n";
import PageHeader from "../PageHeader";

export const EMPTY_LIST_FILTERS = { search: "", year: null, period: null, teacher: null, group: null, page: 1, perPage: 10 };

const uniq = (arr) => [...new Set(arr)];
const NOWRAP = { whiteSpace: "nowrap" };

export default function JournalList({ journals, filters, onChange, onOpen }) {
  const { t } = useI18n();
  const set = (patch) => onChange({ ...filters, page: 1, ...patch });

  const options = useMemo(
    () => ({
      years: uniq(journals.map((j) => j.year)).sort().reverse(),
      periods: uniq(journals.map((j) => j.period)).sort().map((p) => ({ value: String(p), label: t("periodN")(p) })),
      teachers: uniq(journals.map((j) => j.teacher)).sort((a, b) => a.localeCompare(b, "ru")),
      groups: uniq(journals.flatMap((j) => j.groups)).sort(),
    }),
    [journals, t]
  );

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLocaleLowerCase("ru");
    return journals
      .filter(
        (j) =>
          (!q || [j.discipline, j.stream, j.code].some((v) => v.toLocaleLowerCase("ru").includes(q))) &&
          (!filters.year || j.year === filters.year) &&
          (!filters.period || String(j.period) === filters.period) &&
          (!filters.teacher || j.teacher === filters.teacher) &&
          (!filters.group || j.groups.includes(filters.group))
      )
      .sort((a, b) => b.year.localeCompare(a.year) || b.period - a.period || a.discipline.localeCompare(b.discipline, "ru"));
  }, [journals, filters]);

  const active = filters.search || filters.year || filters.period || filters.teacher || filters.group;
  const reset = () => onChange({ ...EMPTY_LIST_FILTERS, perPage: filters.perPage });
  const pages = Math.max(1, Math.ceil(filtered.length / filters.perPage));
  const page = Math.min(filters.page, pages);
  const rows = filtered.slice((page - 1) * filters.perPage, page * filters.perPage);

  return (
    <>
      <PageHeader eyebrow={t("gradebook")} title={t("journal")} />

      <Box bg="var(--mantine-color-default)" style={{ borderRadius: 8 }} p="16px">
        <Group gap="12px" align="flex-end">
          <TextInput
            placeholder={t("searchJournals")}
            aria-label={t("searchJournals")}
            leftSection={<Search size={16} />}
            value={filters.search}
            onChange={(e) => set({ search: e.currentTarget.value })}
            radius="md"
            style={{ flex: "1 1 260px" }}
          />
          <Select placeholder={t("year")} aria-label={t("year")} data={options.years} value={filters.year} onChange={(v) => set({ year: v })} clearable radius="md" w={160} />
          <Select placeholder={t("colPeriod")} aria-label={t("colPeriod")} data={options.periods} value={filters.period} onChange={(v) => set({ period: v })} clearable radius="md" w={230} />
          <Select placeholder={t("colTeacher")} aria-label={t("colTeacher")} data={options.teachers} value={filters.teacher} onChange={(v) => set({ teacher: v })} clearable searchable radius="md" w={200} />
          <Select placeholder={t("filterGroup")} aria-label={t("filterGroup")} data={options.groups} value={filters.group} onChange={(v) => set({ group: v })} clearable searchable radius="md" w={150} />
          <Button variant="subtle" radius="md" leftSection={<FilterX size={16} />} disabled={!active} onClick={reset}>
            {t("resetFilters")}
          </Button>
        </Group>
      </Box>

      <Box bg="var(--mantine-color-default)" style={{ borderRadius: 8 }} p="16px">
        <Stack gap="16px">
          <Text c="dimmed">
            {t("total")}: {filtered.length}
          </Text>

          {filtered.length === 0 ? (
            <Stack align="center" gap={8} py={48} ta="center">
              <SearchX size={32} color="var(--mantine-color-dimmed)" aria-hidden="true" />
              <Text fw={600} fz="md">
                {t("noJournalsT")}
              </Text>
              <Text c="dimmed" fz="sm">
                {t("noJournalsD")}
              </Text>
              <Button mt={8} variant="light" radius="md" leftSection={<FilterX size={16} />} onClick={reset}>
                {t("resetFilters")}
              </Button>
            </Stack>
          ) : (
            <ScrollArea type="auto">
              <Table verticalSpacing="md" miw={900} style={{ background: "var(--mantine-color-body)" }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t("colDiscipline")}</Table.Th>
                    <Table.Th>{t("year")}</Table.Th>
                    <Table.Th>{t("colPeriod")}</Table.Th>
                    <Table.Th>{t("colStream")}</Table.Th>
                    <Table.Th>{t("colGroups")}</Table.Th>
                    <Table.Th>{t("colTeacher")}</Table.Th>
                    <Table.Th ta="center">{t("colStudents")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.map((j) => (
                    <Table.Tr key={j.id} className="du-clickable-row" onClick={() => onOpen(j.id)}>
                      <Table.Td>
                        <UnstyledButton fz="sm" fw={600} c="brand.6" ta="left" display="block">
                          {j.discipline}
                        </UnstyledButton>
                        <Text fz="xs" c="dimmed">
                          {j.code}
                        </Text>
                      </Table.Td>
                      <Table.Td style={NOWRAP}>{j.year}</Table.Td>
                      <Table.Td style={NOWRAP}>{t("periodN")(j.period)}</Table.Td>
                      <Table.Td style={NOWRAP}>{j.stream}</Table.Td>
                      <Table.Td>{j.groups.join(", ")}</Table.Td>
                      <Table.Td style={NOWRAP}>{j.teacher}</Table.Td>
                      <Table.Td ta="center">{j.students.length}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}

          {filtered.length > 0 && (
            <Group justify="flex-end" gap="24px" wrap="wrap">
              <Group gap={8}>
                <Text size="sm">{t("perPage")}</Text>
                <Select
                  data={["10", "30", "50"]}
                  value={String(filters.perPage)}
                  onChange={(v) => onChange({ ...filters, page: 1, perPage: Number(v) })}
                  w={90}
                  radius="sm"
                  allowDeselect={false}
                  aria-label={t("perPage")}
                />
              </Group>
              <Pagination total={pages} value={page} onChange={(p) => onChange({ ...filters, page: p })} radius="xl" />
            </Group>
          )}
        </Stack>
      </Box>
    </>
  );
}
