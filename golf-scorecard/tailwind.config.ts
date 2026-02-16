import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,ts,jsx,tsx,svelte}"],
  theme: {
    extend: {
      colors: {
        // Brand palette (from the logo)
        ink: {
          950: "#141512",
          900: "#191B16",
        },
        gold: {
          50:  "#FFF7DB",
          100: "#FBF4DA", // warm cream highlight
          400: "#F6BC25", // primary gold
          700: "#7B754B", // muted gold/olive accent
        },
        fairway: {
          50:  "#ECF6ED",
          200: "#BFE3C2",
          600: "#276B2A", // primary green
          800: "#1D4F20",
        },

        // Semantic aliases (handy for UI)
        brand: {
          DEFAULT: "#F6BC25",
          ink: "#141512",
          green: "#276B2A",
          cream: "#FBF4DA",
        },
      },

      borderRadius: {
        badge: "9999px",
        card: "1.25rem",
      },

      boxShadow: {
        badge: "0 10px 30px rgba(20,21,18,0.35)",
        lift: "0 12px 40px rgba(20,21,18,0.25)",
        insetRing: "inset 0 0 0 2px rgba(246,188,37,0.55)",
      },

      backgroundImage: {
        // subtle “crest ring” feel
        "crest-radial":
            "radial-gradient(closest-side, rgba(39,107,42,0.20), rgba(20,21,18,0.95))",
        "gold-sheen":
            "linear-gradient(135deg, rgba(246,188,37,1) 0%, rgba(251,244,218,1) 45%, rgba(246,188,37,1) 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;