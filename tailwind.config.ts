import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        "bg-base": "var(--bg-base)",
        "bg-surface": "var(--bg-surface)",
        "text-primary": "var(--text-primary)",
        "text-muted": "var(--text-muted)",
        "accent-primary": "var(--accent-primary)",
        "border-default": "var(--border-default)",
        "state-error": "var(--state-error)",
        "state-success": "var(--state-success)",
        "state-warning": "var(--state-warning)",
      },
    },
  },
};

export default config;
