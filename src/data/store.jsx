import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { INITIAL_YEARS, SEED_SETTINGS, JOURNALS } from "./demo";

const KEY = "du-data-v1";

function load() {
  const initial = { years: INITIAL_YEARS, yearSettings: SEED_SETTINGS, scores: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved ? { ...initial, ...saved } : initial;
  } catch {
    return initial;
  }
}

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState(load);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // storage unavailable — keep working in memory
    }
  }, [data]);

  const saveYearSettings = useCallback((year, values) => {
    setData((d) => ({ ...d, yearSettings: { ...d.yearSettings, [year]: values } }));
  }, []);

  const copySettings = useCallback((source, target) => {
    setData((d) => ({
      ...d,
      yearSettings: { ...d.yearSettings, [target]: { ...(d.yearSettings[source] ?? {}) } },
      years: d.years.includes(target) ? d.years : [...d.years, target].sort().reverse(),
    }));
  }, []);

  // Rejects (leaving state untouched) when the change cannot be persisted, so the caller can keep its draft.
  const saveScores = useCallback(async (journalId, changes) => {
    await new Promise((r) => setTimeout(r, 400));
    const current = dataRef.current;
    const next = {
      ...current,
      scores: { ...current.scores, [journalId]: { ...(current.scores[journalId] ?? {}), ...changes } },
    };
    localStorage.setItem(KEY, JSON.stringify(next));
    setData(next);
  }, []);

  const value = useMemo(
    () => ({ ...data, journals: JOURNALS, saveYearSettings, copySettings, saveScores }),
    [data, saveYearSettings, copySettings, saveScores]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function scoresFor(journal, scores) {
  const saved = scores[journal.id] ?? {};
  return Object.fromEntries(journal.students.map((s) => [s.id, saved[s.id] ?? journal.initialScores[s.id]]));
}
