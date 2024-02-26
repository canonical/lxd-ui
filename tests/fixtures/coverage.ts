import { Page } from "@playwright/test";
import fs from "fs";
import { fromSource, removeMapFileComments } from "convert-source-map";
import v8ToIstanbul from "v8-to-istanbul";
import { CoverageMapData } from "istanbul-lib-coverage";
import { generateUUID } from "util/helpers";

export const startCoverage = async (page: Page): Promise<void> => {
  await page.coverage.startJSCoverage({
    reportAnonymousScripts: true,
    resetOnNavigation: false,
  });
};

export const finishCoverage = async (page: Page): Promise<void> => {
  const coverage = await page.coverage.stopJSCoverage();
  for (const entry of coverage) {
    if (entry.url.endsWith(".css")) {
      continue;
    }
    if (entry.url.includes("@vite")) {
      continue;
    }
    if (entry.url.includes("spice")) {
      continue;
    }
    if (entry.url.includes("node_modules")) {
      continue;
    }
    const fileMatcher = entry.url.match(/http(s)*:\/\/.*:8407\/(?<file>.*)/);
    if (!fileMatcher?.groups) {
      continue;
    }
    const path = fileMatcher.groups.file;
    const source = removeMapFileComments(entry.source ?? "");
    const sourceMap = fromSource(entry.source ?? "") as { sourcemap: string };

    const converter = v8ToIstanbul(path, 0, {
      source,
      sourceMap,
    });
    await converter.load();
    converter.applyCoverage(entry.functions);
    const istanbulCoverage = converter.toIstanbul() as CoverageMapData & {
      [key: string]: { _coverageSchema: string };
    };

    // a unique name for this report
    const uuid = generateUUID();

    // _coverageSchema is mandatory for nyc to parse the report
    Object.entries(istanbulCoverage).forEach(([key]) => {
      istanbulCoverage[key]["_coverageSchema"] = uuid;
    });

    const outDir = "coverage/playwright";
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(
      `${outDir}/playwright_coverage_${uuid}.json`,
      JSON.stringify(istanbulCoverage),
    );
  }
};
