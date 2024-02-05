import { mergeConfig, defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    build: {
      sourcemap: "inline",
    },
    test: {
      globals: true,
      include: ["./src/**/*.spec.{ts,tsx}"],
      coverage: {
        provider: "istanbul",
        reportsDirectory: "coverage/unit",
      },
    },
  }),
);
