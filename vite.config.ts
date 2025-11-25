import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Use relative base so built assets are referenced relative to index.html.
  // This works for Netlify deployments (root) and for archives served from subpaths.
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          vendor: [
            "redux",
            "react-redux",
            "@tanstack/react-query",
            "lucide-react"
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  }
});


