import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Only scan the app itself; otherwise the dep scan crawls the Python venvs
  // in docling-service/ and mineru-service/ and fails on their bundled JS.
  optimizeDeps: {
    entries: ["index.html"],
  },
  server: {
    host: "0.0.0.0",
    // The Python venvs hold ~100k files; watching them makes the dev server crawl.
    watch: {
      ignored: ["**/docling-service/**", "**/mineru-service/**"],
    },
    proxy: {
      "/job-api": {
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/job-api/, ""),
        target: "http://127.0.0.1:5184",
      },
      // mineru-api has no CORS support at all (not even an OPTIONS handler),
      // so the browser's fetch() from MinerUTestPage.tsx gets blocked before
      // the request ever leaves. Proxying through Vite's dev server keeps the
      // browser's request same-origin -- the forward to 127.0.0.1:8000 happens
      // server-side in Node, which isn't subject to CORS at all.
      "/mineru-api": {
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mineru-api/, ""),
        target: "http://127.0.0.1:8000",
      },
    },
  },
});
