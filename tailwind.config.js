/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0073BB",
        secondary: "#013D63",
        tertiary: "#01568B",
        subtitle: "#555555",
        orange: "#EB5757",
        "custom-gray": "#D4E2FE",
        "btn-green": "#078859",
        "light-red": "#FF5B5B",
        "dark-red": "#BA3F3F",
        "light-gray": "#D4D4D4",
        "dark-blue": "#15418B",
        green: {
          30: "rgba(39, 174, 96, 0.3)",
          100: "rgba(39, 174, 96, 1)",
        },
      },
      boxShadow: {
        xl: "0px 0px 6px 1px rgba(0, 0, 0, 0.15)",
      },
      borderRadius: {
        "4xl": "30px",
      },
      screens: {
        tall: { raw: "(max-height: 750px)" },
        "4xl": "1920px",
      },
    },
  },
  plugins: [],
};
