import { useCallback, useMemo } from "react";
import { useI18n } from "../i18n";
import { useData, scoresFor } from "../data/store";
import { useDailyGrades } from "../data/dailyGrades";
import { yearRules, computeScores, admission, dailyValuesFor, formatScore } from "./calc";

const byGroupThenName = (a, b) => a.student.group.localeCompare(b.student.group) || a.student.name.localeCompare(b.student.name, "ru");

export function useJournal(journal) {
  const { scores, yearSettings } = useData();
  const daily = useDailyGrades(journal);
  const rules = useMemo(() => yearRules(yearSettings, journal.year), [yearSettings, journal.year]);
  const studentScores = useMemo(() => scoresFor(journal, scores), [journal, scores]);

  const rows = useMemo(
    () =>
      journal.students
        .map((student) => {
          const sc = studentScores[student.id];
          const dailyValues = dailyValuesFor(daily.columns, daily.grades, student.id);
          const computed = computeScores({ dailyValues, ...sc }, rules);
          return {
            student,
            scores: sc,
            dailyValues,
            ...computed,
            admission: admission({ rd: computed.rd, rk1: sc.rk1, rk2: sc.rk2, attendance: student.attendance }, rules),
          };
        })
        .sort(byGroupThenName),
    [journal, studentScores, daily.columns, daily.grades, rules]
  );

  return { daily, rules, rows, ready: daily.status === "success" || daily.status === "empty" };
}

/** Number formatter bound to the current language; `digits` comes from the year's precision settings. */
export function useFormat() {
  const { lang } = useI18n();
  return useCallback((v, digits) => formatScore(v, digits, lang), [lang]);
}

/** Human-readable admission status and reasons. */
export function useAdmissionText(rules) {
  const { t } = useI18n();
  const fmt = useFormat();
  return useCallback(
    (adm) => {
      const label = { rd: t("rd"), rk1: t("rk1"), rk2: t("rk2"), att: t("attFull") };
      const reasons = adm.reasons.map((r) => {
        if (r.key === "noSettings") return t("noSettings");
        if (r.key === "missing") return t("missing")(r.items.map((k) => label[k]).join(", "));
        const digits = r.key === "rdLow" ? rules.pRd : null;
        return t(r.key)(fmt(r.value, digits), fmt(r.min));
      });
      const title = adm.status === "ok" ? t("admitted") : adm.status === "fail" ? t("notAdmitted") : t("admUnknown");
      return { title, reasons };
    },
    [t, fmt, rules.pRd]
  );
}

export function filterRows(rows, { search, groups, admission }) {
  const q = search.trim().toLocaleLowerCase("ru");
  return rows.filter(
    (r) =>
      (!q || r.student.name.toLocaleLowerCase("ru").includes(q)) &&
      (!groups.length || groups.includes(r.student.group)) &&
      (!admission || r.admission.status === admission)
  );
}

/** Daily grades and the midpoint controls in date order; RK1/RK2 sit where they happened. */
export function timeline(columns, journal) {
  const items = [
    ...columns.map((c, i) => ({ kind: "daily", id: c.id, date: c.date, index: i })),
    { kind: "rk", id: "rk1", date: journal.rk1Date },
    { kind: "rk", id: "rk2", date: journal.rk2Date },
  ];
  return items.sort((a, b) => a.date.localeCompare(b.date) || (a.kind === "rk") - (b.kind === "rk"));
}
