const toNum = (v) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v));

// Module settings of the journal's academic year; null means "not configured".
export function yearRules(yearSettings, year) {
  const s = yearSettings[year] ?? {};
  return {
    minRd: toNum(s.admRating),
    minRk: toNum(s.admEach),
    minAtt: toNum(s.admAttendance),
    pRd: toNum(s.precRating),
    pIk: toNum(s.precExam),
    pIo: toNum(s.precGrade),
  };
}

export const hasAdmissionRules = (r) => r.minRd != null && r.minRk != null && r.minAtt != null;
export const hasPrecisionRules = (r) => r.pRd != null && r.pIk != null && r.pIo != null;

export function round(v, digits) {
  if (v == null || digits == null) return v;
  const f = 10 ** digits;
  return Math.round((v + Number.EPSILON) * f) / f;
}

// Without configured precision values are shown as-is (up to the settings maximum of 5 digits).
export function formatScore(v, digits, lang) {
  if (v == null) return "—";
  return new Intl.NumberFormat(lang === "en" ? "en-US" : "ru-RU", {
    maximumFractionDigits: digits ?? 5,
    useGrouping: false,
  }).format(v);
}

// Empty → no grade (null); 0 is a real grade; "," and "." both work as the decimal separator.
export function parseScore(raw) {
  const s = String(raw ?? "").trim();
  if (s === "") return { valid: true, value: null };
  if (!/^(\d+([.,]\d*)?|[.,]\d+)$/.test(s)) return { valid: false };
  const value = Number(s.replace(",", "."));
  if (value < 0 || value > 100) return { valid: false };
  return { valid: true, value };
}

export const toInput = (v, lang) => (v == null ? "" : String(v).replace(".", lang === "en" ? "." : ","));

/**
 * Derived scores for one student.
 * Auto RD = mean of the daily grades that exist plus RK1 and RK2 (missing values are skipped, never zeroed).
 * IO = 60% RD + 40% IK, only when both are known.
 */
export function computeScores({ dailyValues, rk1, rk2, ik, rdManual }, rules) {
  const items = [...dailyValues, rk1, rk2].filter((v) => v != null);
  const rdAuto = items.length ? round(items.reduce((a, b) => a + b, 0) / items.length, rules.pRd) : null;
  const rdIsManual = rdManual != null;
  const rd = rdIsManual ? round(rdManual, rules.pRd) : rdAuto;
  const ikR = round(ik, rules.pIk);
  const io = rd != null && ikR != null ? round(0.6 * rd + 0.4 * ikR, rules.pIo) : null;
  return { rdAuto, rd, rdIsManual, ik: ikR, io, itemsCount: items.length };
}

/**
 * Admission to the final exam by the year's thresholds.
 * status: "ok" — all conditions met; "fail" — at least one condition failed; "unknown" — not enough data.
 */
export function admission({ rd, rk1, rk2, attendance }, rules) {
  if (!hasAdmissionRules(rules)) return { status: "unknown", reasons: [{ key: "noSettings" }] };
  const checks = [
    ["rd", rd, rules.minRd],
    ["rk1", rk1, rules.minRk],
    ["rk2", rk2, rules.minRk],
    ["att", attendance, rules.minAtt],
  ];
  const failures = [];
  const missing = [];
  for (const [key, value, min] of checks) {
    if (value == null) missing.push(key);
    else if (value < min) failures.push({ key: `${key}Low`, value, min });
  }
  const missingReason = missing.length ? [{ key: "missing", items: missing }] : [];
  if (failures.length) return { status: "fail", reasons: [...failures, ...missingReason] };
  if (missing.length) return { status: "unknown", reasons: missingReason };
  return { status: "ok", reasons: [] };
}

export function dailyValuesFor(columns, grades, studentId) {
  const row = grades[studentId] ?? {};
  return columns.map((c) => row[c.id] ?? null);
}

export const formatDate = (iso) => iso.split("-").reverse().join(".");

// For dates with several grades: position within the day and count, e.g. {n: 2, of: 2}.
export function columnLabels(columns) {
  const byDate = {};
  for (const c of columns) (byDate[c.date] ??= []).push(c.id);
  return Object.fromEntries(
    columns.map((c) => [c.id, { date: formatDate(c.date), time: c.time, n: byDate[c.date].indexOf(c.id) + 1, of: byDate[c.date].length }])
  );
}
