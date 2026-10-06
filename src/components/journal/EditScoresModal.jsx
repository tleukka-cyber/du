import { useMemo, useState } from "react";
import { Modal, Stack, Group, Text, TextInput, MultiSelect, Button, Alert, ActionIcon, Tooltip } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Search, RotateCcw, TriangleAlert } from "lucide-react";
import { useI18n } from "../../i18n";
import { useFormat, filterRows } from "../../journal/useJournal";
import { computeScores, parseScore, toInput } from "../../journal/calc";

const FIELDS = ["rk1", "rk2", "rd", "ik"];
const SAVED_KEY = { rk1: "rk1", rk2: "rk2", rd: "rdManual", ik: "ik" };
const ERRORS_ID = "edit-scores-errors";

/** Draft-based editing of RK1/RK2/RD/IK for many students at once; nothing changes until "Save" succeeds. */
export default function EditScoresModal({ opened, onClose, journal, rows, rules, initialFilters, onSave }) {
  const { t, lang } = useI18n();
  const fmt = useFormat();
  const mobile = useMediaQuery("(max-width: 48em)");
  const [filters, setFilters] = useState(initialFilters);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [draft, setDraft] = useState(() =>
    Object.fromEntries(
      rows.map((r) => [r.student.id, Object.fromEntries(FIELDS.map((f) => [f, toInput(r.scores[SAVED_KEY[f]], lang)]))])
    )
  );

  const evaluated = useMemo(
    () =>
      Object.fromEntries(
        rows.map((r) => {
          const parsed = Object.fromEntries(FIELDS.map((f) => [f, parseScore(draft[r.student.id][f])]));
          const val = (f) => (parsed[f].valid ? parsed[f].value : null);
          const computed = computeScores(
            { dailyValues: r.dailyValues, rk1: val("rk1"), rk2: val("rk2"), ik: val("ik"), rdManual: val("rd") },
            rules
          );
          const changed = Object.fromEntries(FIELDS.map((f) => [f, parsed[f].valid && parsed[f].value !== r.scores[SAVED_KEY[f]]]));
          return [r.student.id, { parsed, val, computed, changed }];
        })
      ),
    [rows, draft, rules]
  );

  const all = Object.values(evaluated);
  const errorCount = all.reduce((n, e) => n + FIELDS.filter((f) => !e.parsed[f].valid).length, 0);
  const changeCount = all.reduce((n, e) => n + FIELDS.filter((f) => e.changed[f]).length, 0);
  const visible = filterRows(rows, filters);

  const setField = (id, field, value) => {
    setSaveError(false);
    setDraft((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));
  };

  const save = async () => {
    const changes = {};
    for (const [id, e] of Object.entries(evaluated)) {
      if (FIELDS.some((f) => e.changed[f])) {
        changes[id] = { rk1: e.val("rk1"), rk2: e.val("rk2"), ik: e.val("ik"), rdManual: e.val("rd") };
      }
    }
    setSaving(true);
    setSaveError(false);
    try {
      await onSave(changes);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const input = (r, field, extra = {}) => {
    const e = evaluated[r.student.id];
    const invalid = !e.parsed[field].valid;
    return (
      <TextInput
        size="xs"
        radius="md"
        w={field === "rd" ? 112 : 84}
        inputMode="decimal"
        value={draft[r.student.id][field]}
        onChange={(ev) => setField(r.student.id, field, ev.currentTarget.value)}
        error={invalid}
        aria-invalid={invalid}
        aria-describedby={invalid ? ERRORS_ID : undefined}
        aria-label={`${t(`${field}Full`)} — ${r.student.name}`}
        title={invalid ? t("invalidValue") : undefined}
        className={e.changed[field] ? "du-cell-changed" : undefined}
        styles={{ input: { textAlign: "center", fontVariantNumeric: "tabular-nums" } }}
        {...extra}
      />
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      closeOnClickOutside={false}
      centered
      fullScreen={mobile}
      size="72rem"
      radius={16}
      shadow="sm"
      title={`${t("editTitle")} · ${journal.discipline}`}
      overlayProps={{ color: "#000", backgroundOpacity: 0.5 }}
      styles={{
        content: { padding: "16px 24px" },
        header: { padding: 0, minHeight: 0, marginBottom: 12 },
        title: { fontSize: 16, lineHeight: "24px", fontWeight: 400 },
        body: { padding: 0 },
      }}
    >
      <Stack gap={12}>
        <Text fz="sm" c="dimmed">
          {t("editHint")} {t("formulaNote")}
        </Text>

        <Group gap={12}>
          <TextInput
            placeholder={t("searchStudent")}
            aria-label={t("searchStudent")}
            leftSection={<Search size={16} />}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.currentTarget.value })}
            radius="md"
            style={{ flex: "1 1 220px" }}
          />
          <MultiSelect
            placeholder={filters.groups.length ? undefined : t("allGroups")}
            aria-label={t("colGroups")}
            data={journal.groups}
            value={filters.groups}
            onChange={(groups) => setFilters({ ...filters, groups })}
            clearable
            radius="md"
            style={{ flex: "0 1 280px" }}
          />
        </Group>

        <div className="du-jt-wrap" style={{ maxHeight: mobile ? "calc(100vh - 340px)" : "55vh" }}>
          <table className="du-jt">
            <thead>
              <tr>
                <th className="du-jt-name">{t("colStudent")}</th>
                {[...FIELDS, "io"].map((k) => (
                  <th key={k} className="du-jt-num">
                    <Tooltip label={t(`${k}Full`)} withArrow>
                      <span>{t(k)}</span>
                    </Tooltip>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const e = evaluated[r.student.id];
                const autoText = fmt(e.computed.rdAuto, rules.pRd);
                const manual = draft[r.student.id].rd.trim() !== "";
                return (
                  <tr key={r.student.id}>
                    <td className="du-jt-name">
                      <Text fz="sm" fw={600} lh="20px">
                        {r.student.name}
                      </Text>
                      <Text fz="xs" c="dimmed" lh="16px">
                        {r.student.group}
                      </Text>
                    </td>
                    <td className="du-jt-num">{input(r, "rk1")}</td>
                    <td className="du-jt-num">{input(r, "rk2")}</td>
                    <td className="du-jt-num">
                      {input(r, "rd", {
                        placeholder: t("rdAutoPh")(autoText),
                        rightSectionPointerEvents: "all",
                        rightSection: manual ? (
                          <Tooltip label={t("rdReset")(autoText)} withArrow>
                            <ActionIcon
                              size="xs"
                              variant="subtle"
                              color="gray"
                              aria-label={`${t("rdReset")(autoText)} — ${r.student.name}`}
                              onClick={() => setField(r.student.id, "rd", "")}
                            >
                              <RotateCcw size={12} />
                            </ActionIcon>
                          </Tooltip>
                        ) : null,
                      })}
                    </td>
                    <td className="du-jt-num">{input(r, "ik")}</td>
                    <td className="du-jt-num">
                      {e.computed.io == null ? (
                        <Tooltip label={e.computed.rd == null ? t("ioNoRd") : t("ioNoIk")} withArrow>
                          <Text span c="dimmed" fz="sm">
                            —
                          </Text>
                        </Tooltip>
                      ) : (
                        <Text span fw={600} fz="sm">
                          {fmt(e.computed.io, rules.pIo)}
                        </Text>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--mantine-color-dimmed)" }}>
                    {t("noStudentsT")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {saveError && (
          <Alert color="red" radius="md" icon={<TriangleAlert size={18} />} role="alert">
            {t("saveFailed")}
          </Alert>
        )}

        <Group justify="space-between" gap={12}>
          <Text id={ERRORS_ID} fz="sm" c={errorCount ? "red" : "dimmed"} role={errorCount ? "alert" : undefined} style={{ flex: "1 1 260px" }}>
            {errorCount ? t("invalidCount")(errorCount) : `${t("changedCount")(changeCount)} · ${t("shownOf")(visible.length, rows.length)}`}
          </Text>
          <Group gap={8}>
            <Button variant="subtle" h={32} px={16} fw={400} radius="md" onClick={onClose} disabled={saving}>
              {t("cancel")}
            </Button>
            <Button h={32} px={16} fw={400} radius="md" onClick={save} loading={saving} disabled={errorCount > 0 || changeCount === 0}>
              {t("save")}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
