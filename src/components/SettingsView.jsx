import { Stack, Text, Table, Group, Select, Pagination, Button, Box, ScrollArea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check } from "lucide-react";
import { useI18n } from "../i18n";

export const YEARS = ["2025-2026", "2024-2025", "2023-2024", "2022-2023", "2021-2022"];

export default function SettingsView({ page, perPage, onPageChange, onPerPageChange, onOpenYear }) {
  const { t } = useI18n();
  const total = YEARS.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, pages);
  const rows = YEARS.slice((currentPage - 1) * perPage, currentPage * perPage);

  const copy = (year) => {
    notifications.show({
      message: t("copied")(year),
      icon: <Check size={14} strokeWidth={3} />,
      color: "teal",
      radius: "md",
      autoClose: 2600,
    });
  };

  return (
    <Box bg="var(--mantine-color-default)" style={{ borderRadius: 8 }} p="16px">
      <Stack gap="16px">
        <Text c="dimmed">
          {t("total")}: {total}
        </Text>

        <ScrollArea type="auto">
          <Table verticalSpacing="md" miw={480} style={{ background: "var(--mantine-color-body)" }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("year")}</Table.Th>
                <Table.Th w={143} ta="center">
                  {t("actions")}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((y) => (
                <Table.Tr key={y}>
                  <Table.Td>
                    <Button
                      variant="transparent"
                      p={0}
                      h="auto"
                      c="brand.6"
                      className="du-year-link"
                      onClick={() => onOpenYear(y)}
                    >
                      {y}
                    </Button>
                  </Table.Td>
                  <Table.Td>
                    <Group justify="center">
                      <Button
                        variant="light"
                        color="brand"
                        radius="xl"
                        size="xs"
                        w={119}
                        h={32}
                        onClick={() => copy(y)}
                      >
                        {t("copy")}
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        <Group justify="flex-end" gap="24px" wrap="wrap">
          <Group gap={8}>
            <Text size="sm">{t("perPage")}</Text>
            <Select
              data={["10", "30", "50"]}
              value={String(perPage)}
              onChange={(v) => onPerPageChange(Number(v))}
              w={90}
              radius="sm"
              allowDeselect={false}
            />
          </Group>
          <Pagination
            total={pages}
            value={currentPage}
            onChange={onPageChange}
            color="brand"
            radius="xl"
            aria-label="Страницы"
          />
        </Group>
      </Stack>
    </Box>
  );
}
