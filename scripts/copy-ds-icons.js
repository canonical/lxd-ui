import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "src");
const iconsDir = join(root, "node_modules/@canonical/ds-assets/icons");
const destDir = join(root, "public/icons");

// Build a set of all available icon names (without .svg extension).
const availableIcons = new Set(
  readdirSync(iconsDir)
    .filter((f) => f.endsWith(".svg"))
    .map((f) => f.slice(0, -4)),
);

// Scan source files for any string literal that matches an available icon name.
// This catches both iconName="..." props and dsResourceIcons object values.
const usedIcons = new Set();
const scanDir = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(full);
    } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
      const content = readFileSync(full, "utf-8");
      for (const [, name] of content.matchAll(/["']([a-z][a-z0-9-]*)["']/g)) {
        if (availableIcons.has(name)) {
          usedIcons.add(name);
        }
      }
    }
  }
};

scanDir(srcDir);
// Recreate the destination so icons whose usage was removed don't linger.
rmSync(destDir, { recursive: true, force: true });
mkdirSync(destDir, { recursive: true });

for (const name of usedIcons) {
  copyFileSync(join(iconsDir, `${name}.svg`), join(destDir, `${name}.svg`));
}

console.log(`Copied ${usedIcons.size} icons to public/icons/`);
