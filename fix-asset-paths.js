#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildDir = path.join(__dirname, "build", "ui");
const indexPath = path.join(buildDir, "index.html");

if (!fs.existsSync(indexPath)) {
  console.error("Build index.html not found at:", indexPath);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, "utf-8");

// 1. Patterns to find Vite's original tags
const scriptPattern = /<script type="module"[^>]*src="\.\/assets\/([^"]+)"[^>]*><\/script>/g;
const linkPattern = /<link rel="stylesheet"[^>]*href="\.\/assets\/([^"]+)"[^>]*>/g;

const scriptAssets = [];
const linkAssets = [];

// 2. Extract and remove original tags
html = html.replace(scriptPattern, (match, filename) => {
  scriptAssets.push(filename);
  return "";
});

html = html.replace(linkPattern, (match, filename) => {
  linkAssets.push(filename);
  return "";
});

// 3. Inject into the existing IIFE
if (scriptAssets.length > 0 || linkAssets.length > 0) {
  const dynamicAssetsCode = [
    ...scriptAssets.map((filename) => {
      const varName = `script_${filename.replace(/[^a-zA-Z0-9]/g, "_")}`;
      return `
        const ${varName} = document.createElement('script');
        ${varName}.type = 'module';
        ${varName}.crossOrigin = '';
        ${varName}.src = window.ROOT_PATH + '/ui/assets/${filename}';
        document.head.appendChild(${varName});`;
    }),
    ...linkAssets.map((filename) => {
      const varName = `link_${filename.replace(/[^a-zA-Z0-9]/g, "_")}`;
      return `
        const ${varName} = document.createElement('link');
        ${varName}.rel = 'stylesheet';
        ${varName}.crossOrigin = '';
        ${varName}.href = window.ROOT_PATH + '/ui/assets/${filename}';
        document.head.appendChild(${varName});`;
    }),
  ].join("\n");

  /**
   * We look for the end of the existing IIFE (the last "})();")
   * and insert our code just before it.
   */
  html = html.replace("})();", `${dynamicAssetsCode}\n      })();`);
}

fs.writeFileSync(indexPath, html, "utf-8");

console.log("Fixed asset paths in build/ui/index.html");
