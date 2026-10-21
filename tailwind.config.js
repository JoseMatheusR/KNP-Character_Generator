/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0B0B09",
        foreground: "#F2E7CF",
        card: "#15130F",
        "card-strong": "#201B14",
        border: "#7D6C58",
        primary: "#D05E3E",
        "primary-soft": "#3A1C17",
        accent: "#D7A63B",
        destructive: "#E05A47",
        success: "#9FBA72",
        muted: "#29231B",
        "muted-foreground": "#B5A68F",
        sand: "#E0BE83",
        terminal: "#B7CC8A",
      },
      fontFamily: {
        mono: ["SpaceMono"],
        display: ["SpaceMono"],
      },
    },
  },
  plugins: [],
};
