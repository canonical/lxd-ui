import { mergeConfig, defineConfig } from "vitest/config";
import viteConfig from "./vite.config";
import path from "path";

export default mergeConfig(
  viteConfig,
  defineConfig({
    build: {
      sourcemap: "inline",
    },
    test: {
      environment: "jsdom",
      globals: true,
      include: ["./src/**/*.spec.{ts,tsx}"],
      css: true,
      alias: {
        "#lib": path.resolve(
          __dirname,
          "node_modules/@canonical/react-ds-global/dist/esm/lib",
        ),
      },
      coverage: {
        provider: "istanbul",
        reportsDirectory: "coverage/unit",
      },
      server: {
        deps: {
          inline: ["@canonical/react-ds-global"],
        },
      },
    },
  }),
);
