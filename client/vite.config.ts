import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": resolve("./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React runtime — changes almost never, maximises cache hits
          "vendor-react": ["react", "react-dom"],

          // Routing — large, rarely updated
          "vendor-router": ["@tanstack/react-router"],

          // Data fetching
          "vendor-query": ["@tanstack/react-query"],

          // UI component library — biggest single contributor to the main bundle
          "vendor-ui": ["@material-tailwind/react"],

          // Real-time
          "vendor-socket": ["socket.io-client"],

          // Forms + validation — loaded on auth pages only but referenced widely
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],

          // HTTP client
          "vendor-axios": ["axios"],

          // State management
          "vendor-state": ["zustand"],

          // Utilities — small but widely imported across chunks
          "vendor-utils": ["tailwind-merge", "react-hot-toast", "use-debounce"],

          // Phone input — pulls in google-libphonenumber which is large
          "vendor-phone": ["react-phone-number-input", "libphonenumber-js"],

          // Icon library — tree-shaken per icon but the runtime helpers are shared
          "vendor-icons": ["@heroicons/react"],
        },
      },
    },
  },
});
