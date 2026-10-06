import { Box, Text, Title, Breadcrumbs, Anchor, Group, SimpleGrid, Stack } from "@mantine/core";
import { Slash } from "lucide-react";

function MetaLine({ label, value }) {
  return (
    <Text fz="sm" lh="20px">
      <Text span c="dimmed">
        {label}:
      </Text>{" "}
      <Text span fw={600}>
        {value}
      </Text>
    </Text>
  );
}

/**
 * Breadcrumbs (last item = current page) + headbar with eyebrow, title, optional actions and details:
 * `meta` — one wrapping row of label/value pairs, `metaColumns` — label/value pairs in two columns.
 */
export default function PageHeader({ crumbs, eyebrow, title, meta, metaColumns, actions }) {
  return (
    <>
      {crumbs?.length > 0 && (
        <Breadcrumbs separator={<Slash size={16} color="var(--mantine-color-dimmed)" />} separatorMargin={4} fz="sm">
          {crumbs.map((c, i) =>
            i < crumbs.length - 1 ? (
              <Anchor key={i} component="button" type="button" c="var(--mantine-color-text)" fz="sm" onClick={c.onClick}>
                {c.label}
              </Anchor>
            ) : (
              <Text key={i} fz="sm" c="brand.6" aria-current="page">
                {c.label}
              </Text>
            )
          )}
        </Breadcrumbs>
      )}

      <Box bg="var(--mantine-color-body)" style={{ borderRadius: 8 }} p="16px">
        <Group justify="space-between" align="flex-start" gap="16px">
          <Box style={{ minWidth: 0 }}>
            <Text fw={600} c="dimmed">
              {eyebrow}
            </Text>
            <Title order={2} style={{ fontSize: 24, lineHeight: "32px", fontWeight: 700, margin: 0 }}>
              {title}
            </Title>
          </Box>
          {actions}
        </Group>
        {meta && (
          <Group gap="8px 24px" mt="12px">
            {meta.map((m) => (
              <MetaLine key={m.label} {...m} />
            ))}
          </Group>
        )}
        {metaColumns && (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={72} verticalSpacing={4} mt={20}>
            {metaColumns.map((col, i) => (
              <Stack key={i} gap={4}>
                {col.map((m) => (
                  <MetaLine key={m.label} {...m} />
                ))}
              </Stack>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </>
  );
}
