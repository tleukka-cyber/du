import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./styles.css";
import { theme } from "./theme";
import { LangProvider } from "./i18n";
import { DataProvider } from "./data/store";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications position="top-right" />
      <LangProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </LangProvider>
    </MantineProvider>
  </React.StrictMode>
);
