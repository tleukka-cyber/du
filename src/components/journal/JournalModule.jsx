import { useEffect, useState } from "react";
import { useData } from "../../data/store";
import JournalList, { EMPTY_LIST_FILTERS } from "./JournalList";
import JournalPage, { EMPTY_JOURNAL_FILTERS } from "./JournalPage";
import StudentPage from "./StudentPage";

/**
 * "Journal" section: list → discipline journal → student page.
 * Filters live here so they survive going back (student → journal → list).
 */
export default function JournalModule({ home, onOpenSettings }) {
  const { journals } = useData();
  const [route, setRoute] = useState({ page: "list" });
  const [listFilters, setListFilters] = useState(EMPTY_LIST_FILTERS);
  const [journalFilters, setJournalFilters] = useState({});

  useEffect(() => {
    setRoute({ page: "list" });
  }, [home]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  const journal = journals.find((j) => j.id === route.journalId);
  const toList = () => setRoute({ page: "list" });
  const toJournal = (journalId) => setRoute({ page: "journal", journalId });

  if (route.page === "list" || !journal) {
    return <JournalList journals={journals} filters={listFilters} onChange={setListFilters} onOpen={toJournal} />;
  }

  if (route.page === "student") {
    return (
      <StudentPage
        key={route.studentId}
        journal={journal}
        studentId={route.studentId}
        onBackToList={toList}
        onBackToJournal={() => toJournal(journal.id)}
      />
    );
  }

  return (
    <JournalPage
      key={journal.id}
      journal={journal}
      filters={journalFilters[journal.id] ?? EMPTY_JOURNAL_FILTERS}
      onFiltersChange={(f) => setJournalFilters((all) => ({ ...all, [journal.id]: f }))}
      onBack={toList}
      onOpenStudent={(studentId) => setRoute({ page: "student", journalId: journal.id, studentId })}
      onOpenSettings={onOpenSettings}
    />
  );
}
