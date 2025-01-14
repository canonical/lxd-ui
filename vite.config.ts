import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

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
    port: 3000,
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
