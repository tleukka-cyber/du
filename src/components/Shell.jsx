import { useState } from "react";
import { Box, Stack, Text, Title } from "@mantine/core";
import { useI18n } from "../i18n";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import SettingsView from "./SettingsView";
import JournalView from "./JournalView";
import YearDetailView from "./YearDetailView";

export default function Shell({ onLogout }) {
  const { t } = useI18n();
  const [view, setView] = useState("settings");
  const [year, setYear] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(30);

  const changeView = (next) => {
    setView(next);
    setYear(null);
  };

  const title = year ? t("openYear")(year) : view === "journal" ? t("journal") : t("settings");

  return (
    <Box style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar onLogout={onLogout} />
      <Box className="du-layout" style={{ flex: 1, display: "flex", alignItems: "stretch", minHeight: 0 }}>
        <Sidebar view={view} onViewChange={changeView} />
        <Box component="main" className="du-main" style={{ flex: 1, minWidth: 0 }} p="24px">
          <Stack gap="16px">
            <Box bg="var(--mantine-color-body)" style={{ borderRadius: 8 }} p="16px">
              <Text fw={600} c="dimmed">
                {t("gradebook")}
              </Text>
              <Title order={2} style={{ fontSize: 24, lineHeight: "32px", fontWeight: 700, margin: 0 }}>
                {title}
              </Title>
            </Box>

            {view === "journal" && <JournalView />}

            {view === "settings" && !year && (
              <SettingsView
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

            {view === "settings" && year && <YearDetailView year={year} onBack={() => setYear(null)} />}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
