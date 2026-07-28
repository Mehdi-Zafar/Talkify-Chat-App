import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": resolve("./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["@tanstack/react-router"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-socket": ["socket.io-client"],
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          "vendor-axios": ["axios"],
          "vendor-state": ["zustand"],
          "vendor-utils": ["tailwind-merge"],
          "vendor-phone": ["react-phone-number-input", "libphonenumber-js"],
          "vendor-icons": ["lucide-react"],
        },
      },
    },
  },
});
