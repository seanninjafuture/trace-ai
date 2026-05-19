import { dark } from "@clerk/ui/themes";

const fontSans =
  'var(--font-sans), ui-sans-serif, system-ui, -apple-system, sans-serif';
const fontMono =
  'var(--font-mono), ui-monospace, "Cascadia Code", monospace';

export const clerkAppearance = {
  theme: dark,
  variables: {
    colorBackground: "var(--bg-base)",
    colorInputBackground: "var(--bg-surface)",
    colorText: "var(--text-primary)",
    colorTextSecondary: "var(--text-muted)",
    colorPrimary: "var(--accent-primary)",
    colorDanger: "var(--state-error)",
    colorSuccess: "var(--state-success)",
    colorWarning: "var(--state-warning)",
    colorNeutral: "var(--text-muted)",
    colorForeground: "var(--text-primary)",
    colorInput: "var(--bg-surface)",
    colorInputText: "var(--text-primary)",
    colorBorder: "var(--border-default)",
    colorMuted: "var(--bg-surface)",
    colorMutedForeground: "var(--text-muted)",
    colorModalBackdrop: "color-mix(in srgb, var(--bg-base) 80%, transparent)",
    borderRadius: "var(--radius)",
    fontFamily: fontSans,
    fontFamilyButtons: fontSans,
    fontFamilyMono: fontMono,
  },
  elements: {
    rootBox: {
      width: "100%",
      fontFamily: fontSans,
    },
    cardBox: {
      width: "100%",
      boxShadow: "none",
    },
    card: {
      backgroundColor: "transparent",
      border: "none",
      boxShadow: "none",
      fontFamily: fontSans,
    },
    headerTitle: {
      fontFamily: fontSans,
      fontWeight: 600,
    },
    headerSubtitle: {
      fontFamily: fontSans,
    },
    formFieldLabel: {
      fontFamily: fontSans,
    },
    formFieldInput: {
      fontFamily: fontSans,
    },
    formButtonPrimary: {
      fontFamily: fontSans,
      fontWeight: 500,
    },
    socialButtonsBlockButton: {
      fontFamily: fontSans,
    },
    footer: {
      background: "transparent",
      fontFamily: fontSans,
    },
    footerActionLink: {
      fontFamily: fontSans,
    },
  },
} as const;
