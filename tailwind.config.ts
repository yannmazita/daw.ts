import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "ts-blue": "#5bcefa",
        "ts-pink": "#f5a9b8",
        // Main application colors using slate
        background: {
          DEFAULT: "rgb(var(--background))",
          primary: "rgb(var(--slate-100))",
          secondary: "rgb(var(--slate-200))",
          dark: "rgb(var(--slate-900))",
        },

        // UI element colors
        border: {
          DEFAULT: "rgb(var(--slate-200))",
          dark: "rgb(var(--slate-800))",
        },

        // Interactive element colors
        ring: {
          DEFAULT: "rgb(var(--slate-200))",
          dark: "rgb(var(--slate-800))",
        },

        // Text colors
        text: {
          primary: "rgb(var(--slate-900))",
          secondary: "rgb(var(--slate-700))",
          muted: "rgb(var(--slate-500))",
          dark: "rgb(var(--slate-50))",
        },

        // DAW-specific colors
        daw: {
          // Waveform and visualization colors
          waveform: {
            background: "rgb(var(--slate-800))",
            primary: "rgb(var(--slate-400))",
            secondary: "rgb(var(--slate-600))",
          },
          // Track colors
          track: {
            background: "rgb(var(--slate-700))",
            border: "rgb(var(--slate-600))",
            selected: "rgb(var(--slate-500))",
          },
          // Control colors
          control: {
            background: "rgb(var(--slate-200))",
            active: "rgb(var(--slate-300))",
            dark: "rgb(var(--slate-800))",
          },
        },
      },
      // Animation configurations
      animation: {
        "fade-in": "fade-in 0.2s ease-in-out",
        "fade-out": "fade-out 0.2s ease-in-out",
        "slide-up": "slide-up 0.2s ease-out",
        "slide-down": "slide-down 0.2s ease-out",
      },

      // Keyframe definitions
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },

      // DAW-specific sizing
      spacing: {
        track: "128px", // Standard track height
        marker: "24px", // Timeline marker height
        grid: "24px", // Grid line spacing
      },
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
  },
  plugins: [
    tailwindcssAnimate,
    typography,
    // Custom plugin for DAW-specific utilities
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".grid-pattern": {
          "background-image":
            "linear-gradient(to right, var(--slate-200) 1px, transparent 1px), linear-gradient(to bottom, var(--slate-200) 1px, transparent 1px)",
          "background-size": "24px 24px",
        },
      });
    },
  ],
} satisfies Config;
