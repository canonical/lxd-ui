import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, mergeConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import libraryConfig from "./vite.config";

/**
 * This config is used for the demo service. The main Vite config sets up the
 * package to build in library mode, but we need to serve the demo application instead.
 */
export default defineConfig((env) => {
  const previewConfig = defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    return {
      build: {
        // Use a different location to the library build.
        outDir: "build",
      },
      preview: {
        port: Number(env.PORT),
      },
    };
  });
  const libConfig = libraryConfig(env);
  delete libConfig.build;
  libConfig.plugins = [react(), tsconfigPaths()];
  return mergeConfig(libConfig, previewConfig(env));
});
