import { useCallback, useEffect, useState } from "react";

// Demo stand-in for the backend endpoint that will return daily grades pulled from Moodle.
// Journals flagged `moodle: "empty"` return no grades; `"error-once"` keeps failing until the
// error has actually been shown once, so the error/retry state can be exercised.
const cache = new Map();
// counted on display rather than on request: StrictMode's discarded first request must not use it up
const failureShown = new Set();

function request(journal) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (journal.moodle === "error-once" && !failureShown.has(journal.id)) {
        reject(new Error("Demo: daily grades request failed"));
        return;
      }
      const empty = journal.moodle === "empty";
      resolve({ columns: empty ? [] : journal.columns, grades: empty ? {} : journal.daily, loadedAt: new Date() });
    }, 700);
  });
}

const toState = (data) => ({ status: data.columns.length ? "success" : "empty", ...data });

export function useDailyGrades(journal) {
  const [state, setState] = useState(() =>
    cache.has(journal.id) ? toState(cache.get(journal.id)) : { status: "loading", columns: [], grades: {} }
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cache.has(journal.id)) {
      setState(toState(cache.get(journal.id)));
      return;
    }
    let alive = true;
    setState({ status: "loading", columns: [], grades: {} });
    request(journal).then(
      (data) => {
        cache.set(journal.id, data);
        if (alive) setState(toState(data));
      },
      () => {
        if (!alive) return;
        failureShown.add(journal.id);
        setState({ status: "error", columns: [], grades: {} });
      }
    );
    return () => {
      alive = false;
    };
  }, [journal, attempt]);

  const retry = useCallback(() => {
    cache.delete(journal.id);
    setAttempt((a) => a + 1);
  }, [journal.id]);

  return { ...state, retry };
}
