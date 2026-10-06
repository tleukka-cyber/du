import { useState } from "react";
import { Box, Stack } from "@mantine/core";
import { useI18n } from "../i18n";
import { useData } from "../data/store";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import PageHeader from "./PageHeader";
import SettingsView from "./SettingsView";
import YearSettingsForm from "./YearSettingsForm";
import JournalModule from "./journal/JournalModule";
import AcademicGroupsModule from './academic/AcademicGroupsModule';

export default function Shell({ onLogout }) {
  const { t } = useI18n();
  const { years, yearSettings, saveYearSettings, copySettings } = useData();
  const [view, setView] = useState("settings");
  const [year, setYear] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(30);
  // bumped when the sidebar "Journal" tab is clicked, so the module returns to the journal list
  const [journalHome, setJournalHome] = useState(0);

  const changeView = (next) => {
    setView(next);
    setYear(null);
    if (next === "journal") setJournalHome((n) => n + 1);
  };

  const openYearSettings = (y) => {
    setView("settings");
    setYear(y);
  };

  return (
    <Box style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar onLogout={onLogout} />
      <Box className="du-layout" style={{ flex: 1, display: "flex", alignItems: "stretch", minHeight: 0 }}>
        <Sidebar view={view} onViewChange={changeView} />
        <Box component="main" className="du-main" style={{ flex: 1, minWidth: 0 }} p="24px">
          <Stack gap="16px">
            {view === 'academicGroups' && <AcademicGroupsModule />}
            {view === "journal" && <JournalModule home={journalHome} onOpenSettings={openYearSettings} />}

            {view === "settings" && (
              <PageHeader
                crumbs={year ? [{ label: t("settings"), onClick: () => setYear(null) }, { label: t("openYear")(year) }] : null}
                eyebrow={year ? t("settings") : t("gradebook")}
                title={year ? t("openYear")(year) : t("settings")}
              />
            )}

            {view === "settings" && !year && (
              <SettingsView
                years={years}
                onCopy={copySettings}
                page={page}
                perPage={perPage}
                onPageChange={setPage}
                onPerPageChange={(n) => {
                  setPerPage(n);
                  setPage(1);
                }}
                onOpenYear={setYear}
              />
            )}

            {view === "settings" && year && (
              <YearSettingsForm
                key={year}
                initialValues={yearSettings[year] ?? {}}
                onSave={(values) => saveYearSettings(year, values)}
              />
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
