/**
 * Rewrites the absolute file paths in an istanbul coverage JSON file to be
 * relative to the current working directory (the repository root).
 *
 * The playwright e2e coverage reports use relative paths (see
 * tests/fixtures/coverage.ts) so they can be merged on a different machine
 * than the one that produced them. The vitest unit coverage report uses
 * absolute paths, so it is rewritten here to ensure both report types merge
 * into a single entry per file in nyc.
 */
import fs from "node:fs";
import nodePath from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node tests/scripts/relativize-coverage.mjs <file>");
  process.exit(1);
}

const coverage = JSON.parse(fs.readFileSync(file, "utf8"));
const relativeCoverage = {};
for (const [key, value] of Object.entries(coverage)) {
  const relativeKey = nodePath.relative(process.cwd(), key);
  relativeCoverage[relativeKey] = { ...value, path: relativeKey };
}
fs.writeFileSync(file, JSON.stringify(relativeCoverage));
