/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#4f47e5",
        accent: "#e1e6fe",
        muted: "#6d7281",
        foreground: "#1f2836",
        background: "#ffffff",
        border: "#f3f4f6",
        success: {
          DEFAULT: "#065e47",
          accent: "#d1fae6",
        },
        warning: {
          DEFAULT: "#93410f",
          accent: "#fef3c7",
        },
        danger: {
          DEFAULT: "#b91d1a",
          accent: "#fff3f2",
        },
      },
    },
  },
  plugins: [],
};
