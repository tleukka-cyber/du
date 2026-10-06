import { useState } from "react";
import { Box, Stack, Group, Text, TextInput, MultiSelect, Select, Button, Alert, Tabs, Divider, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Search, PencilLine, FilterX, SearchX, Settings2, Check, CircleCheck, CircleX, CircleHelp, Users, History } from "lucide-react";
import { useI18n } from "../../i18n";
import { useData } from "../../data/store";
import { useJournal, filterRows, useFormat } from "../../journal/useJournal";
import { hasAdmissionRules, hasPrecisionRules } from "../../journal/calc";
import PageHeader from "../PageHeader";
import DailyStatus from "./DailyStatus";
import JournalTable from "./JournalTable";
import EditScoresModal from "./EditScoresModal";
import StreamsSummary from "./StreamsSummary";

export const EMPTY_JOURNAL_FILTERS = { search: "", groups: [], admission: null };

export function journalMetaColumns(journal, t) {
  return [
    [
      { label: t("metaDiscipline"), value: journal.discipline },
      { label: t("metaLessonType"), value: t(`lesson_${journal.lessonType}`) },
      { label: t("year"), value: journal.year },
      { label: t("colPeriod"), value: t("periodN")(journal.period) },
      { label: t("metaLanguage"), value: t(`lang_${journal.language}`) },
      { label: t("metaTeacher"), value: journal.teacher },
    ],
    [
      { label: t("colGroups"), value: journal.groups.join(", ") },
      { label: t("colStream"), value: journal.stream },
      { label: t("metaStudents"), value: journal.students.length },
      { label: t("metaOnline"), value: journal.online ? t("yes") : t("no") },
      { label: t("metaExamForm"), value: t(`exam_${journal.examForm}`) },
      { label: t("metaProctor"), value: journal.proctor },
    ],
  ];
}

function Legend({ rules }) {
  const { t } = useI18n();
  const fmt = useFormat();
  const abbr = ["rk1", "rk2", "rd", "ik", "io"].map((k) => `${t(k)} — ${t(`${k}Full`)}`).join(" · ");
  const icon = { size: 14, style: { verticalAlign: "-2px" }, "aria-hidden": true };
  return (
    <Stack gap={4}>
      <Text fz="xs" c="dimmed">
        {abbr}
      </Text>
      <Group gap={16}>
        <Text fz="xs" c="dimmed">
          <CircleCheck {...icon} color="var(--mantine-color-teal-light-color)" /> {t("admitted")}
        </Text>
        <Text fz="xs" c="dimmed">
          <CircleX {...icon} color="var(--mantine-color-red-light-color)" /> {t("notAdmitted")}
        </Text>
        <Text fz="xs" c="dimmed">
          <CircleHelp {...icon} /> {t("admUnknown")}
        </Text>
      </Group>
      <Text fz="xs" c="dimmed">
        {hasAdmissionRules(rules) && `${t("thresholds")(fmt(rules.minRd), fmt(rules.minRk), fmt(rules.minAtt))}. `}
        {t("formulaNote")}
      </Text>
    </Stack>
  );
}

export default function JournalPage({ journal, filters, onFiltersChange, onBack, onOpenStudent, onOpenSettings }) {
  const { t } = useI18n();
  const { saveScores } = useData();
  const { daily, rules, rows, ready } = useJournal(journal);
  const [tab, setTab] = useState("students");
  const [editOpened, setEditOpened] = useState(false);
  const [editKey, setEditKey] = useState(0);

  const visible = filterRows(rows, filters);
  const filtersActive = filters.search || filters.groups.length > 0 || filters.admission;
  const settingsMissing = !hasAdmissionRules(rules) || !hasPrecisionRules(rules);
  const set = (patch) => onFiltersChange({ ...filters, ...patch });

  const openEdit = () => {
    setEditKey((k) => k + 1);
    setEditOpened(true);
  };

  const handleSave = async (changes) => {
    await saveScores(journal.id, changes);
    setEditOpened(false);
    notifications.show({ message: t("scoresSaved"), icon: <Check size={14} strokeWidth={3} />, color: "teal", radius: "md", autoClose: 2600 });
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: t("journal"), onClick: onBack }, { label: journal.code }]}
        eyebrow={t("journal")}
        title={journal.code}
        metaColumns={journalMetaColumns(journal, t)}
        actions={
          <Tooltip label={t("inProgress")} withArrow>
            <Button
              variant="light"
              size="compact-sm"
              radius="xl"
              fw={400}
              leftSection={<History size={14} />}
              data-disabled
              onClick={(e) => e.preventDefault()}
            >
              {t("history")}
            </Button>
          </Tooltip>
        }
      />

      {settingsMissing && (
        <Alert color="yellow" radius="md" title={t("noSettingsT")(journal.year)}>
          <Text fz="sm" mb={8}>
            {t("noSettingsD")}
          </Text>
          <Button size="xs" radius="md" variant="white" color="yellow" leftSection={<Settings2 size={14} />} onClick={() => onOpenSettings(journal.year)}>
            {t("openSettings")}
          </Button>
        </Alert>
      )}

      <Box bg="var(--mantine-color-default)" style={{ borderRadius: 8 }} p="16px">
        <Tabs value={tab} onChange={setTab}>
          <Tabs.List mb="16px">
            <Tabs.Tab value="students">{t("tabStudents")}</Tabs.Tab>
            <Tabs.Tab value="streams">{t("tabStreams")}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="students">
            <Stack gap="16px">
              <Group gap={12} wrap="nowrap">
                <Group gap={8} wrap="nowrap">
                  <Users size={24} color="var(--mantine-color-brand-6)" style={{ flex: "none" }} />
                  <Text fz={18} lh="28px" fw={600}>
                    {t("tabStudents")}
                  </Text>
                </Group>
                <Divider style={{ flex: 1 }} />
                <Button variant="light" size="compact-sm" radius="md" fw={400} leftSection={<PencilLine size={14} />} onClick={openEdit} disabled={!ready}>
                  {t("editScores")}
                </Button>
              </Group>

              <Group gap="16px" align="flex-end">
                <TextInput
                  label={t("searchLabel")}
                  placeholder={t("searchStudentPh")}
                  leftSection={<Search size={16} />}
                  value={filters.search}
                  onChange={(e) => set({ search: e.currentTarget.value })}
                  radius="md"
                  w={330}
                  maw="100%"
                />
                <MultiSelect
                  label={t("filterGroup")}
                  placeholder={filters.groups.length ? undefined : t("all")}
                  data={journal.groups}
                  value={filters.groups}
                  onChange={(groups) => set({ groups })}
                  clearable
                  radius="md"
                  w={330}
                  maw="100%"
                />
                <Select
                  label={t("filterAdmission")}
                  placeholder={t("all")}
                  data={[
                    { value: "ok", label: t("admOkShort") },
                    { value: "fail", label: t("admFailShort") },
                    { value: "unknown", label: t("admUnknownShort") },
                  ]}
                  value={filters.admission}
                  onChange={(admission) => set({ admission })}
                  clearable
                  radius="md"
                  w={330}
                  maw="100%"
                />
              </Group>

              <DailyStatus daily={daily} />

              {ready &&
                (visible.length ? (
                  <>
                    <JournalTable journal={journal} columns={daily.columns} rows={visible} rules={rules} onOpenStudent={onOpenStudent} />
                    <Group justify="space-between" align="flex-start" gap={12}>
                      <Legend rules={rules} />
                      <Text fz="xs" c="dimmed">
                        {t("shownOf")(visible.length, rows.length)}
                      </Text>
                    </Group>
                  </>
                ) : (
                  <Stack align="center" gap={8} py={40} ta="center">
                    <SearchX size={32} color="var(--mantine-color-dimmed)" aria-hidden="true" />
                    <Text fw={600}>{t("noStudentsT")}</Text>
                    {filtersActive && (
                      <Button variant="light" radius="md" leftSection={<FilterX size={16} />} onClick={() => onFiltersChange(EMPTY_JOURNAL_FILTERS)}>
                        {t("resetFilters")}
                      </Button>
                    )}
                  </Stack>
                ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="streams">
            {ready ? <StreamsSummary journal={journal} rows={rows} /> : <DailyStatus daily={daily} />}
          </Tabs.Panel>
        </Tabs>
      </Box>

      {ready && (
        <EditScoresModal
          key={editKey}
          opened={editOpened}
          onClose={() => setEditOpened(false)}
          journal={journal}
          rows={rows}
          rules={rules}
          initialFilters={filters}
          onSave={handleSave}
        />
      )}
    </>
  );
}
