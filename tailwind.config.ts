import type { Config } from "tailwindcss";

import { nextui } from "@nextui-org/react";
import colors from "tailwindcss/colors";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // light mode
        tremor: {
          brand: {
            faint: "#F7931A10", // Bitcoin Orange with 10% opacity
            muted: "#F7931A50", // Bitcoin Orange with 50% opacity
            subtle: "#F7931A", // Bitcoin Orange
            DEFAULT: "#F7931A", // Bitcoin Orange
            emphasis: "#8A2BE2", // Nostr Purple
            inverted: "#FFFFFF", // White
          },
          background: {
            muted: "#F5F5F5", // Light background
            subtle: "#E8E8E8", // Light gray
            DEFAULT: "#FFFFFF", // White
            emphasis: "#1A1A1A", // Dark text
          },
          border: {
            DEFAULT: "#E8E8E8", // Light gray
          },
          ring: {
            DEFAULT: "#E8E8E8", // Light gray
          },
          content: {
            subtle: "#6C757D", // Neutral gray
            DEFAULT: "#1A1A1A", // Dark text
            emphasis: "#1A1A1A", // Dark text
            strong: "#000000", // Black
            inverted: "#FFFFFF", // White
          },
        },
        // dark mode
        "dark-tremor": {
          brand: {
            faint: "#0B1229", // Dark blue
            muted: "#8A2BE250", // Nostr Purple with 50% opacity
            subtle: "#8A2BE2", // Nostr Purple
            DEFAULT: "#8A2BE2", // Nostr Purple
            emphasis: "#F7931A", // Bitcoin Orange
            inverted: "#1A1A1A", // Dark background
          },
          background: {
            muted: "#131A2B", // Dark blue
            subtle: "#2D2D2D", // Dark gray
            DEFAULT: "#1A1A1A", // Dark background
            emphasis: "#FFFFFF", // Light text
          },
          border: {
            DEFAULT: "#2D2D2D", // Dark gray
          },
          ring: {
            DEFAULT: "#2D2D2D", // Dark gray
          },
          content: {
            subtle: "#6C757D", // Neutral gray
            DEFAULT: "#FFFFFF", // Light text
            emphasis: "#F5F5F5", // Light background
            strong: "#FFFFFF", // Light text
            inverted: "#1A1A1A", // Dark background
          },
        },
      },
      boxShadow: {
        // light
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        // dark
        "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "dark-tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "dark-tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
      borderRadius: {
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",
      },
      fontSize: {
        "tremor-label": ["0.75rem", { lineHeight: "1rem" }],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],
      },
    },
    colors: {
      "bitcoin-orange": "#F7931A", // Primary accent
      "nostr-purple": "#8A2BE2", // Secondary accent
      "dark-bg": "#1A1A1A", // Dark background
      "light-bg": "#F5F5F5", // Light background
      "light-text": "#FFFFFF", // Light text
      "dark-text": "#1A1A1A", // Dark text
      "accent-text-bitcoin": "#F7931A", // Bitcoin orange text
      "accent-text-nostr": "#8A2BE2", // Nostr purple text
      "success-green": "#28A745", // Success messages
      "error-red": "#DC3545", // Error messages
      "neutral-gray": "#6C757D", // Borders, dividers
      ...colors,
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  darkMode: "class",
  plugins: [nextui()],
};

export default config;