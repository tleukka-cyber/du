import { useState } from "react";
import { Box, UnstyledButton, Group, Text, Collapse, Stack } from "@mantine/core";
import { SpellCheck, ChevronUp, BookOpen } from "lucide-react";
import { useI18n } from "../i18n";

const TABS = [
  { key: "settings", labelKey: "settings" },
  { key: "journal", labelKey: "journal" },
];

export default function Sidebar({ view, onViewChange }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);
  const [eduOpen, setEduOpen] = useState(true);

  return (
    <Box
      component="nav"
      className="du-sidebar"
      aria-label="Разделы"
      w={235}
      p="12px 16px"
      bg="var(--mantine-color-body)"
      style={{ flex: "none" }}
    >
      <Box className="du-sidebar-group" w={203} py="12px">
        <UnstyledButton onClick={() => setEduOpen(v => !v)} aria-expanded={eduOpen} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 12px' }}>
          <Group gap={8} wrap="nowrap"><BookOpen size={16} style={{ flexShrink: 0 }} /><Text fz={12} lh="16px">{t('eduProcess')}</Text></Group>
          <ChevronUp size={16} style={{ flexShrink: 0, transform: eduOpen ? 'none' : 'rotate(180deg)' }} />
        </UnstyledButton>
        <Collapse in={eduOpen}><Stack gap={0} mt={8}><UnstyledButton className="du-sidebar-tab" data-active={view === 'academicGroups'} aria-current={view === 'academicGroups' ? 'page' : undefined} onClick={() => onViewChange('academicGroups')}>{t('academicGroups')}</UnstyledButton></Stack></Collapse>
      </Box>
      <Box className="du-sidebar-group" w={203} py="12px">
        <UnstyledButton
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0 12px" }}
        >
          <Group gap={8}>
            <SpellCheck size={16} />
            <Text fz={12} lh="16px">
              {t("gradebook")}
            </Text>
          </Group>
          <ChevronUp size={16} style={{ transform: open ? "none" : "rotate(180deg)", transition: "transform .15s" }} />
        </UnstyledButton>
        <Collapse in={open}>
          <Stack gap={0} mt={8}>
            {TABS.map(({ key, labelKey }) => (
              <UnstyledButton
                key={key}
                className="du-sidebar-tab"
                data-active={view === key}
                aria-current={view === key ? "page" : undefined}
                onClick={() => onViewChange(key)}
              >
                {t(labelKey)}
              </UnstyledButton>
            ))}
          </Stack>
        </Collapse>
      </Box>
    </Box>
  );
}
