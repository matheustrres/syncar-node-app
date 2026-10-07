import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        syncar: {
          canvas: "var(--syncar-canvas)",
          surface: "var(--syncar-surface)",
          subtle: "var(--syncar-surface-subtle)",
          text: "var(--syncar-text)",
          muted: "var(--syncar-text-muted)",
          border: "var(--syncar-border)",
          brand: "var(--syncar-green-950)",
          "brand-raised": "var(--syncar-green-900)",
          action: "var(--syncar-action)",
          "action-hover": "var(--syncar-action-hover)",
          "action-text": "var(--syncar-action-text)",
          focus: "var(--syncar-focus)",
          success: "var(--syncar-success)",
          warning: "var(--syncar-warning)",
          danger: "var(--syncar-danger)",
          info: "var(--syncar-info)",
        },
      },
      borderRadius: {
        "syncar-control": "var(--syncar-radius-control)",
        "syncar-panel": "var(--syncar-radius-panel)",
      },
      boxShadow: {
        "syncar-overlay": "var(--syncar-shadow-overlay)",
      },
    },
  },
  plugins: [],
};
export default config;
