// Demo data used while there is no backend. Daily grades stand in for what the backend will
// deliver from Moodle; RK1/RK2/IK/manual RD are the editable scores.

export const INITIAL_YEARS = ["2026-2027", "2025-2026", "2024-2025", "2023-2024", "2022-2023", "2021-2022"];

export const SEED_SETTINGS = {
  "2026-2027": { admRating: 50, admEach: 25, admAttendance: 70, precRating: 1, precExam: 1, precGrade: 0 },
  "2025-2026": { admRating: 50, admEach: 30, admAttendance: 75, precRating: 2, precExam: 2, precGrade: 2 },
};

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const half = (v) => Math.round(v * 2) / 2;

const SURNAMES = ["Ахметов", "Сериков", "Нурланов", "Жумабеков", "Касымов", "Оспанов", "Тлеубаев", "Абенов", "Ермеков", "Исаев", "Мухамедов", "Байжанов", "Кенжебеков", "Омаров", "Есенов", "Смагулов", "Иванов", "Петров", "Ким", "Сулейменов"];
const MALE = ["Нурлан", "Арман", "Данияр", "Ерлан", "Тимур", "Алихан", "Санжар", "Бекзат", "Азамат", "Руслан", "Максим", "Дамир"];
const FEMALE = ["Айгерим", "Дана", "Асель", "Мадина", "Алия", "Жанель", "Камила", "Аружан", "Динара", "Сабина", "Анель", "Томирис"];
const FATHERS = ["Берик", "Серик", "Нурлан", "Ерлан", "Марат", "Болат", "Кайрат", "Асхат"];

function fullName(rng) {
  const female = rng() < 0.5;
  let surname = SURNAMES[Math.floor(rng() * SURNAMES.length)];
  if (female && surname !== "Ким") surname += "а";
  const first = (female ? FEMALE : MALE)[Math.floor(rng() * 12)];
  const father = FATHERS[Math.floor(rng() * FATHERS.length)];
  return `${surname} ${first} ${father}${female ? "овна" : "ович"}`;
}

function makeColumns(id, start, weekdays, count, duplicateEvery) {
  const cols = [];
  const d = new Date(`${start}T00:00:00`);
  let n = 0;
  while (n < count) {
    if (weekdays.includes(d.getDay())) {
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const twice = duplicateEvery && (n + 1) % duplicateEvery === 0 && n + 1 < count;
      if (twice) {
        cols.push({ id: `${id}-c${n}`, date, time: "10:00" });
        cols.push({ id: `${id}-c${n + 1}`, date, time: "14:00" });
        n += 2;
      } else {
        cols.push({ id: `${id}-c${n}`, date, time: "10:00" });
        n += 1;
      }
    }
    d.setDate(d.getDate() + 1);
  }
  return cols;
}

function generateJournal(cfg) {
  const rng = mulberry32(cfg.seed);
  const columns = makeColumns(cfg.id, cfg.start, cfg.weekdays, cfg.columns, cfg.duplicateEvery);
  const students = [];
  const daily = {};
  const initialScores = {};
  for (let i = 0; i < cfg.students; i++) {
    const id = `${cfg.id}-s${i}`;
    const level = 35 + rng() * 62;
    const group = cfg.groups[i % cfg.groups.length];
    students.push({ id, name: fullName(rng), group, attendance: half(clamp(level + 10 + (rng() - 0.5) * 30, 40, 100)) });
    daily[id] = {};
    for (const c of columns) {
      const r = rng();
      daily[id][c.id] = r < 0.04 ? null : r < 0.06 ? 0 : half(clamp(level + (rng() - 0.5) * 30, 0, 100));
    }
    const score = () => half(clamp(level + (rng() - 0.5) * 24, 0, 100));
    initialScores[id] = {
      rk1: cfg.stage === "early" ? null : score(),
      rk2: cfg.stage === "final" ? score() : null,
      ik: cfg.stage === "final" && rng() > 0.1 ? score() : null,
      rdManual: null,
    };
  }
  return { ...pick(cfg), columns, students, daily, initialScores };
}

function pick({ id, discipline, year, period, stream, groups, teacher, moodle }) {
  return { id, discipline, year, period, stream, groups, teacher, moodle: moodle ?? "ok" };
}

// Showcase journal: one student per admission scenario (thresholds 2025-2026: RD ≥ 50, RK ≥ 30, attendance ≥ 75).
const OOP_COLUMNS = [
  ["2026-01-12", "10:00"], ["2026-01-15", "10:00"], ["2026-01-19", "10:00"], ["2026-01-22", "10:00"], ["2026-01-22", "14:00"],
  ["2026-01-26", "10:00"], ["2026-01-29", "10:00"], ["2026-02-02", "10:00"], ["2026-02-05", "10:00"], ["2026-02-09", "10:00"],
].map(([date, time], i) => ({ id: `oop-c${i}`, date, time }));

const N = null;
const OOP_STUDENTS = [
  // name, group, attendance, daily, rk1, rk2, ik, rdManual
  ["Абенова Дана Маратовна", "SE-2401", 96, [90, 85, 92, 88, 95, 91, 87, 93, 89, 94], 86, 90, 88, N],
  ["Байжанов Арман Ерланович", "SE-2401", 88, [40, 35, 45, 30, 38, 42, 36, 44, 39, 41], 40, 35, 55, N],
  ["Ермеков Данияр Асхатович", "SE-2402", 91, [78, 82, 75, 80, 85, 79, 81, 77, 84, 80], 72, 22, 70, N],
  ["Исаева Мадина Болатовна", "SE-2402", 61.5, [85, 88, 90, 86, 84, 89, 87, 91, 88, 90], 84, 86, 80, N],
  ["Касымов Тимур Кайратович", "SE-2403", 52, [30, 25, 0, 35, N, 28, 32, 20, N, 26], 18, 34, N, N],
  ["Мухамедова Алия Нурлановна", "SE-2403", 84, [75, N, 80, N, 78, 82, N, 79, 81, 77], 76, N, N, N],
  ["Нурланов Санжар Серикович", "SE-2401", 79, [0, 65, 70, 0, 68, 72, 0, 66, 71, 69], 64, 67, 62, N],
  ["Оспанова Жанель Ерлановна", "SE-2402", 93.5, [87.5, 91.25, 88, 92.75, 90, 89.5, 93, 88.25, 91, 90.5], 72.25, 85.5, 91.75, N],
  ["Сатпаев Алихан Маратович", "SE-2403", 89, [82, 79, 85, 81, N, 84, 80, 83, 86, 82], 80, 78, N, N],
  ["Тлеубаева Камила Асхатовна", "SE-2401", 82, [45, 50, 40, 48, 52, 44, 46, 50, 42, 47], 48, 46, 74, 55],
  ["Жумабеков Ерлан Болатович", "SE-2402", 97, [96, 98, 95, 99, 97, 100, 96, 98, 97, 99], 94, 96, 97, N],
  ["Ким Анель Викторовна", "SE-2403", 76, [70, 72, 68, 74, N, 71, 69, 73, 70, 72], 66, 69, 71, N],
];

const oopJournal = {
  ...pick({
    id: "oop",
    discipline: "Объектно-ориентированное программирование",
    year: "2025-2026",
    period: 2,
    stream: "SE-24 · поток 1",
    groups: ["SE-2401", "SE-2402", "SE-2403"],
    teacher: "Ахметова А. С.",
  }),
  columns: OOP_COLUMNS,
  students: OOP_STUDENTS.map(([name, group, attendance], i) => ({ id: `oop-s${i}`, name, group, attendance })),
  daily: Object.fromEntries(
    OOP_STUDENTS.map((s, i) => [`oop-s${i}`, Object.fromEntries(OOP_COLUMNS.map((c, j) => [c.id, s[3][j]]))])
  ),
  initialScores: Object.fromEntries(
    OOP_STUDENTS.map(([, , , , rk1, rk2, ik, rdManual], i) => [`oop-s${i}`, { rk1, rk2, ik, rdManual }])
  ),
};

const MON_WED = [1, 3];
const MON_WED_FRI = [1, 3, 5];
const TUE_THU = [2, 4];

// Header details. lessonType / language / examForm are keys translated in i18n.
const META = {
  oop: { code: "SE2205-RU-L1", lessonType: "lecture", language: "ru", online: false, examForm: "exam", proctor: "Бекова Л. А.", rk1Date: "2026-01-24", rk2Date: "2026-02-11" },
  db: { code: "CS2104-RU-L1", lessonType: "lecture", language: "ru", online: false, examForm: "exam", proctor: "Омаров Т. К." },
  web: { code: "SE2310-EN-P1", lessonType: "practice", language: "en", online: true, examForm: "project", proctor: "Бекова Л. А." },
  math: { code: "CS1101-KZ-L1", lessonType: "lecture", language: "kz", online: false, examForm: "exam", proctor: "Омаров Т. К.", rk1Date: "2026-10-20", rk2Date: "2026-12-15" },
  phys: { code: "SE1203-RU-L2", lessonType: "lecture", language: "ru", online: false, examForm: "exam", proctor: "Есенова А. М." },
  eng: { code: "ENG2201-EN-P3", lessonType: "practice", language: "en", online: false, examForm: "test", proctor: "Есенова А. М." },
  algo: { code: "SE2101-EN-L1", lessonType: "lecture", language: "en", online: false, examForm: "exam", proctor: "Омаров Т. К." },
  net: { code: "CS2307-RU-LB1", lessonType: "lab", language: "ru", online: false, examForm: "exam", proctor: "Бекова Л. А." },
  os: { code: "CS2206-RU-L1", lessonType: "lecture", language: "ru", online: true, examForm: "exam", proctor: "Есенова А. М." },
  prob: { code: "SE2108-KZ-P2", lessonType: "practice", language: "kz", online: false, examForm: "test", proctor: "Омаров Т. К." },
  ml: { code: "SE3301-EN-L1", lessonType: "lecture", language: "en", online: false, examForm: "project", proctor: "Бекова Л. А." },
  hist: { code: "HIS1101-KZ-L4", lessonType: "lecture", language: "kz", online: true, examForm: "test", proctor: "Есенова А. М." },
};

const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// RK dates place the midpoint controls in the journal timeline: RK1 mid-way through the dates, RK2 after the last one.
function withMeta(j) {
  const meta = META[j.id];
  const cols = j.columns;
  return {
    ...j,
    ...meta,
    rk1Date: meta.rk1Date ?? addDays(cols[Math.floor(cols.length / 2)].date, 1),
    rk2Date: meta.rk2Date ?? addDays(cols[cols.length - 1].date, 2),
  };
}

export const JOURNALS = [
  oopJournal,
  generateJournal({ id: "db", seed: 11, discipline: "Базы данных", year: "2026-2027", period: 1, stream: "CS-25 · поток 1", groups: ["CS-2501", "CS-2502"], teacher: "Сериков Д. М.", students: 9, start: "2026-09-07", weekdays: MON_WED, columns: 9, duplicateEvery: 5, stage: "midterm" }),
  generateJournal({ id: "web", seed: 23, discipline: "Веб-разработка", year: "2025-2026", period: 1, stream: "SE-24 · поток 2", groups: ["SE-2401", "SE-2404"], teacher: "Ахметова А. С.", students: 14, start: "2025-09-01", weekdays: MON_WED_FRI, columns: 36, duplicateEvery: 12, stage: "final" }),
  generateJournal({ id: "math", seed: 31, discipline: "Математический анализ", year: "2026-2027", period: 1, stream: "CS-25 · поток 1", groups: ["CS-2501", "CS-2503"], teacher: "Оспанова Г. К.", students: 10, start: "2026-09-08", weekdays: TUE_THU, columns: 0, stage: "early", moodle: "empty" }),
  generateJournal({ id: "phys", seed: 37, discipline: "Физика", year: "2026-2027", period: 1, stream: "SE-25 · поток 1", groups: ["SE-2501", "SE-2502"], teacher: "Ким В. А.", students: 8, start: "2026-09-08", weekdays: TUE_THU, columns: 8, stage: "early", moodle: "error-once" }),
  generateJournal({ id: "eng", seed: 41, discipline: "Английский язык (B2)", year: "2025-2026", period: 2, stream: "SE-24 · поток 1", groups: ["SE-2401"], teacher: "Джонсон Э.", students: 7, start: "2026-01-13", weekdays: TUE_THU, columns: 12, stage: "final" }),
  generateJournal({ id: "algo", seed: 43, discipline: "Алгоритмы и структуры данных", year: "2025-2026", period: 1, stream: "SE-24 · поток 1", groups: ["SE-2401", "SE-2402", "SE-2403"], teacher: "Ахметов Н. Б.", students: 12, start: "2025-09-02", weekdays: TUE_THU, columns: 14, duplicateEvery: 7, stage: "final" }),
  generateJournal({ id: "net", seed: 47, discipline: "Компьютерные сети", year: "2026-2027", period: 1, stream: "CS-25 · поток 2", groups: ["CS-2502", "CS-2503"], teacher: "Касымов Е. Т.", students: 10, start: "2026-09-07", weekdays: MON_WED, columns: 8, stage: "early" }),
  generateJournal({ id: "os", seed: 53, discipline: "Операционные системы", year: "2025-2026", period: 2, stream: "CS-24 · поток 1", groups: ["CS-2401", "CS-2402"], teacher: "Касымов Е. Т.", students: 11, start: "2026-01-12", weekdays: MON_WED, columns: 15, stage: "final" }),
  generateJournal({ id: "prob", seed: 59, discipline: "Теория вероятностей", year: "2025-2026", period: 2, stream: "SE-24 · поток 2", groups: ["SE-2403", "SE-2404"], teacher: "Оспанова Г. К.", students: 9, start: "2026-01-13", weekdays: TUE_THU, columns: 12, stage: "final" }),
  generateJournal({ id: "ml", seed: 61, discipline: "Введение в машинное обучение", year: "2026-2027", period: 1, stream: "SE-24 · поток 1", groups: ["SE-2401", "SE-2402"], teacher: "Ахметов Н. Б.", students: 8, start: "2026-09-09", weekdays: [3, 5], columns: 7, stage: "early" }),
  generateJournal({ id: "hist", seed: 67, discipline: "История Казахстана", year: "2026-2027", period: 1, stream: "CS-25 · поток 1", groups: ["CS-2501", "CS-2502", "CS-2503"], teacher: "Жумабекова С. Р.", students: 12, start: "2026-09-07", weekdays: [1], columns: 4, stage: "early" }),
].map(withMeta);
