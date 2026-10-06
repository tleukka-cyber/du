import { createTheme, Input } from "@mantine/core";

export const theme = createTheme({
  components: {
    InputWrapper: Input.Wrapper.extend({
      styles: {
        label: { display: "block", fontWeight: 600, lineHeight: "20px" },
        description: { lineHeight: "16px", marginTop: 0, marginBottom: 0 },
      },
    }),
  },
  fontFamily: 'Roboto, system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
  headings: {
    fontFamily: 'Roboto, system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
    fontWeight: "700",
  },
  primaryColor: "brand",
  primaryShade: 6,
  defaultRadius: "md",
  radius: {
    xs: "2px",
    sm: "4px",
    md: "8px",
    lg: "24px",
    xl: "32px",
  },
  colors: {
    brand: [
      "#e6f1ff",
      "#cce3ff",
      "#99c7ff",
      "#66aaff",
      "#338eff",
      "#1a80ff",
      "#006fff",
      "#005ad1",
      "#004aad",
      "#003a89",
    ],
    // overridden to match Figma's exact dark-mode token values
    dark: [
      "#f1f3f5",
      "#dee2e6",
      "#909296",
      "#5c5f66",
      "#373a40",
      "#2c2e33",
      "#25262b",
      "#1a1b1e",
      "#141619",
      "#101113",
    ],
  },
});
