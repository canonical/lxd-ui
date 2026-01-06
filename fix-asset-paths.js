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

// Replace Vite's relative asset paths with JavaScript that generates absolute paths
const scriptPattern =
  /<script type="module"[^>]*src="\.\/assets\/([^"]+)"[^>]*><\/script>/g;
const linkPattern =
  /<link rel="stylesheet"[^>]*href="\.\/assets\/([^"]+)"[^>]*>/g;

const scriptAssets = [];
const linkAssets = [];

// Extract script assets
html = html.replace(scriptPattern, (match, filename) => {
  scriptAssets.push(filename);
  return ""; // Remove the original tag
});

// Extract link assets
html = html.replace(linkPattern, (match, filename) => {
  linkAssets.push(filename);
  return ""; // Remove the original tag
});

if (scriptAssets.length > 0 || linkAssets.length > 0) {
  const assetScript = `<script>
    (function() {
      ${scriptAssets
        .map(
          (filename) => `
      const script_${filename.replace(/[^a-zA-Z0-9]/g, "_")} = document.createElement('script');
      script_${filename.replace(/[^a-zA-Z0-9]/g, "_")}.type = 'module';
      script_${filename.replace(/[^a-zA-Z0-9]/g, "_")}.crossOrigin = '';
      script_${filename.replace(/[^a-zA-Z0-9]/g, "_")}.src = window.ROOT_PATH + '/ui/assets/${filename}';
      document.head.appendChild(script_${filename.replace(/[^a-zA-Z0-9]/g, "_")});`,
        )
        .join("")}
      ${linkAssets
        .map(
          (filename) => `
      const link_${filename.replace(/[^a-zA-Z0-9]/g, "_")} = document.createElement('link');
      link_${filename.replace(/[^a-zA-Z0-9]/g, "_")}.rel = 'stylesheet';
      link_${filename.replace(/[^a-zA-Z0-9]/g, "_")}.crossOrigin = '';
      link_${filename.replace(/[^a-zA-Z0-9]/g, "_")}.href = window.ROOT_PATH + '/ui/assets/${filename}';
      document.head.appendChild(link_${filename.replace(/[^a-zA-Z0-9]/g, "_")});`,
        )
        .join("")}
    })();
  </script>`;

  html = html.replace("</head>", assetScript + "\n  </head>");
}

fs.writeFileSync(indexPath, html, "utf-8");

console.log("Fixed asset paths in build/ui/index.html");
