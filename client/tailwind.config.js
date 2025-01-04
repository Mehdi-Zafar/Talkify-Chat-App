/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
// import withMT from "@material-tailwind/react/utils/withMT";

export default withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        lightPrimary: "#1877F2",
        darkPrimary: "#301934",
        lightText: "#36454F",
        darkText: "#eee",
        lightBg: "#fff",
        darkBg: "#1d1d1d",
        lightBody: "#f2f2f2",
        darkBody: "#222",
        stepper: {
          button: "#4CAF50", // Customize the background color
          buttonHover: "#45A049", // Hover effect color
        },
      },
    },
  },
  darkMode: "class",
  plugins: [],
});
