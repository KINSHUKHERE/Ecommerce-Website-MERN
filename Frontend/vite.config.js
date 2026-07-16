import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    visualizer({
      filename: "stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react-core") || id.includes("react/") || id.endsWith("/react")) {
              return "react";
            }
            if (id.includes("react-router-dom")) {
              return "router";
            }
            if (id.includes("recharts")) {
              return "charts";
            }
            if (id.includes("framer-motion")) {
              return "motion";
            }
            if (id.includes("lucide-react") || id.includes("lucide")) {
              return "icons";
            }
            if (id.includes("axios")) {
              return "axios";
            }
            if (id.includes("@react-oauth/google")) {
              return "oauth";
            }
          }
        },
      },
    },
  },
  server: {
    watch: {
      ignored: ["**/public/**"],
    },
  },
});
