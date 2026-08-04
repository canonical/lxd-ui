import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const DS_ICONS_DIR = path.resolve(
  __dirname,
  "node_modules/@canonical/ds-assets/icons",
);

// Serves @canonical/ds-assets icons at /icons/ without copying files to public/.
// - dev: intercepts requests to /icons/* and streams from node_modules
// - build: emits each SVG as a build asset so they land in the output directory
const dsAssetsIconsPlugin = (): Plugin => ({
  name: "ds-assets-icons",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (!req.url?.startsWith("/icons/")) {
        next();
        return;
      }
      const file = path.join(DS_ICONS_DIR, req.url.slice("/icons/".length));
      // Prevent path traversal attacks (e.g. /icons/../../etc/passwd).
      // path.join resolves ".." segments, so we verify the result still sits
      // inside DS_ICONS_DIR before serving it.
      if (!file.startsWith(DS_ICONS_DIR) || !fs.existsSync(file)) {
        next();
        return;
      }
      res.setHeader("Content-Type", "image/svg+xml");
      fs.createReadStream(file).pipe(res);
    });
  },
  generateBundle() {
    for (const name of fs.readdirSync(DS_ICONS_DIR)) {
      if (!name.endsWith(".svg")) {
        continue;
      }

      this.emitFile({
        type: "asset",
        fileName: `icons/${name}`,
        source: fs.readFileSync(path.join(DS_ICONS_DIR, name), "utf-8"),
      });
    }
  },
});

// Load .env.local if it exists to override default environment variables
dotenv.config({ path: ".env", quiet: true });
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
}

// Provide the SCSS settings from the _settings.scss file.
// SCSS in react-components can reference variables like customized $breakpoint-large and should use our settings.
const scssSettings = fs.readFileSync("src/sass/_settings.scss", "utf-8").trim();

const getGitHash = () => {
  // set permissions for workshop, ignore this in other environments
  execSync(
    "[ -d /home/ubuntu/lxd-ui ] && git config --global --add safe.directory /home/ubuntu/lxd-ui || true",
  );
  // Get the short git hash of the current commit
  const result = execSync("git rev-parse --short HEAD").toString().trim();
  return JSON.stringify(result);
};

export default defineConfig({
  base: "",
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["global-builtin", "import", "if-function"],
        additionalData: scssSettings,
      },
    },
  },
  plugins: [tsconfigPaths(), react(), dsAssetsIconsPlugin()],
  server: {
    port: process.env.VITE_PORT ? Number(process.env.VITE_PORT) : 3000,
    strictPort: true,
    hmr: process.env.CI ? false : undefined,
    proxy: {
      "^/ui/(assets|manifest.json)": {
        target: `http://localhost:${process.env.VITE_PORT || 3000}`,
        rewrite: (path) => path.replace(/^\/ui/, ""),
        secure: false,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "./build/ui",
    minify: "esbuild",
  },
  define: {
    __UI_GIT_HASH__: getGitHash(),
  },
});
