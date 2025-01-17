import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import * as dotenv from "dotenv";
import * as fs from "fs";

// Load .env.local if it exists to override default environment variables
dotenv.config({ path: ".env" });
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
}

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["mixed-decls", "global-builtin", "import"],
      },
    },
  },
  plugins: [tsconfigPaths(), react()],
  server: {
    port: process.env.VITE_PORT ? Number(process.env.VITE_PORT) : 3000,
    strictPort: true,
    proxy: {
      "/ui/assets": {
        target: "https://localhost:8407/",
        rewrite: (path) => path.replace(/^\/ui/, ""),
        secure: false,
      },
      "/ui/monaco-editor": {
        target: "https://localhost:8407/node_modules",
        rewrite: (path) => path.replace(/^\/ui/, ""),
        secure: false,
      },
    },
  },
  build: {
    outDir: "./build/ui",
    minify: "esbuild",
  },
  experimental: {
    renderBuiltUrl(filename: string) {
      return "/ui/" + filename;
    },
  },
});
