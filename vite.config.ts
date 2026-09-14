import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/job-api": {
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/job-api/, ""),
        target: "http://127.0.0.1:5184",
      },
    },
  },
});

