import AxeBuilder from "@axe-core/playwright";
import type { AxeResults, Result } from "axe-core";
import type { Page, TestInfo } from "@playwright/test";
import { writeFile } from "fs/promises";
import { test } from "../fixtures/lxd-test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"];

const MODAL_SELECTOR = ".p-modal";
export const PANEL_SELECTOR = '[aria-label="Side panel"]';

const sanitizeForFilename = (
  value: string | undefined,
  fallback = "unknown",
): string => {
  const raw = value?.trim() || fallback;
  const sanitized = raw.replace(/[^a-zA-Z0-9.-]/g, "_");
  return sanitized.slice(0, 80);
};

const MINIMUM_PASSING_RATE = 80;
const MAX_CRITICAL_VIOLATIONS = 3;

const printSummary = (
  percent: number,
  passed: number,
  failed: number,
  incomplete: number,
  testName: string,
  severities: Record<string, number>,
): void => {
  console.log("-----------------------------------------");
  console.log("A11Y Report");
  console.log(`Test: ${testName}`);
  console.log("-----------------------------------------");

  console.log("\nCoverage:");
  console.log(`- Rules evaluated: ${passed + failed + incomplete}`);
  console.log(`- Passing rate: ${percent.toFixed(2)}%`);

  console.log("\nSummary:");
  console.log("- Passed:", passed);
  console.log("- Failed:", failed);
  console.log("- Incomplete:", incomplete);
  console.log("- Severities:", severities);
};

const formatViolations = (violations: Result[]): string => {
  return violations
    .map((v, i) => {
      const selectors = v.nodes
        .map((n) => n.target.join(" "))
        .slice(0, 5)
        .join("\n      ");
      const extra =
        v.nodes.length > 5 ? `\n      ... and ${v.nodes.length - 5} more` : "";
      return [
        `  ${i + 1}. [${v.impact}] ${v.id}: ${v.description}`,
        `     Help: ${v.helpUrl}`,
        `     Affected elements:\n      ${selectors}${extra}`,
      ].join("\n");
    })
    .join("\n\n");
};

const countSeverities = (results: AxeResults): Record<string, number> => {
  const counts: Record<string, number> = {};
  const arraysToScan: Result[][] = [
    results.violations || [],
    results.incomplete || [],
  ];

  for (const arr of arraysToScan) {
    for (const rule of arr) {
      const impact = rule.impact || "unknown";
      counts[impact] = (counts[impact] || 0) + 1;
    }
  }

  return counts;
};

const processA11yResults = async (
  results: AxeResults,
  testInfo: TestInfo,
): Promise<number> => {
  const passed = results.passes?.length ?? 0;
  const violations = results.violations?.length ?? 0;
  const incomplete = results.incomplete?.length ?? 0;
  const total = passed + violations + incomplete;
  const percent = total === 0 ? 100 : (passed / total) * 100;

  const severities = countSeverities(results);
  const testName = testInfo.title;

  printSummary(percent, passed, violations, incomplete, testName, severities);

  if (results.violations.length > 0) {
    console.log(
      `\n${results.violations.length} violation(s) found. Full details available in the a11y-report artifact.`,
    );
  }

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "_");

    const report = {
      meta: {
        testName,
        percent,
        passed,
        violations,
        incomplete,
        severities,
        timestamp,
      },
      results,
    };

    const testSuite = testInfo.titlePath.at(-2);
    const filename = sanitizeForFilename(
      `${testSuite}-${testName}-${timestamp}.json`,
    );
    const outPath = testInfo.outputPath(filename);
    await writeFile(outPath, JSON.stringify(report, null, 2), "utf8");

    await testInfo.attach(filename, {
      path: outPath,
      contentType: "application/json",
    });
  } catch (err) {
    console.error("Failed to write/attach a11y report:", err);
  }

  const criticalViolations = results.violations.filter(
    (v) => v.impact === "critical",
  );

  if (criticalViolations.length > MAX_CRITICAL_VIOLATIONS) {
    throw new Error(
      `A11y audit failed: ${criticalViolations.length} critical violation(s) found (threshold: ${MAX_CRITICAL_VIOLATIONS}).\n\n` +
        formatViolations(criticalViolations),
    );
  }

  if (percent < MINIMUM_PASSING_RATE) {
    throw new Error(
      `A11y audit failed: passing rate ${percent.toFixed(0)}% is below the ${MINIMUM_PASSING_RATE}% threshold.\n` +
        `Summary: ${passed} passed, ${violations} violation(s), ${incomplete} incomplete.\n\n`,
    );
  }

  return percent;
};

export const runA11yAudit = async (
  page: Page,
  testInfo: TestInfo,
): Promise<number> => {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  return processA11yResults(results, testInfo);
};

export const runA11yAuditForPanel = async (
  page: Page,
  testInfo: TestInfo,
): Promise<number> => {
  await page.locator(PANEL_SELECTOR).waitFor({ state: "visible" });

  const results = await new AxeBuilder({ page })
    .include(PANEL_SELECTOR)
    .withTags(WCAG_TAGS)
    .analyze();

  return processA11yResults(results, testInfo);
};

export const runA11yAuditForModal = async (
  page: Page,
  testInfo: TestInfo,
): Promise<number> => {
  await page.locator(MODAL_SELECTOR).waitFor({ state: "visible" });

  const results = await new AxeBuilder({ page })
    .include(MODAL_SELECTOR)
    .withTags(WCAG_TAGS)
    .analyze();

  return processA11yResults(results, testInfo);
};

export const skipIfNotA11yProject = (projectName: string) => {
  test.skip(
    !isA11yProject(projectName),
    "This test should only be run for the a11y-audit project",
  );
};

export const isA11yProject = (projectName: string) => {
  return projectName === "a11y-audit";
};
