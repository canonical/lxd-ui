import { gotoURL } from "./navigate";
import AxeBuilder from "@axe-core/playwright";
import type { AxeResults, Result, CrossTreeSelector } from "axe-core";
import type { Page, TestInfo } from "@playwright/test";
import { writeFile } from "fs/promises";

interface A11yResult {
  id: string;
  slug: string;
  tags: string[];
  type: string;
  description: string;
  nodes: CrossTreeSelector[];
}

const generateResult = (
  results: AxeResults,
  type: "pass" | "violation",
  slug: string,
): A11yResult[] => {
  let targetAttr: Result[];
  if (type === "pass") targetAttr = results.passes;
  else targetAttr = results.violations;

  const result: A11yResult[] = [];

  for (const instance of targetAttr) {
    const resultObject: A11yResult = {
      id: instance.id,
      slug,
      type,
      tags: instance.tags,
      description: instance.description,
      nodes: [],
    };
    for (const node of instance.nodes) {
      const targets = Array.isArray(node.target) ? node.target : [node.target];
      for (const target of targets) {
        resultObject.nodes.push(target);
      }
    }
    result.push(resultObject);
  }
  return result;
};

const printSummary = (
  percent: number,
  passed: number,
  failed: number,
  incomplete: number,
  slug: string,
  testName: string,
  severities: Record<string, number>,
): void => {
  console.log("-----------------------------------------");
  console.log("A11Y Report");
  console.log(`Page: ${slug}`);
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

const clickSideNavItem = async (
  page: Page,
  slug: string,
  parentSlug?: string,
): Promise<void> => {
  await gotoURL(page, `/ui/project/default`);
  await page.waitForLoadState("networkidle");

  if (parentSlug) {
    await page.getByRole("button", { name: parentSlug }).click();
  }
  await page.getByRole("link", { name: slug, exact: true }).first().click();
  await page.waitForLoadState("networkidle");
};

export const runA11yAudit = async (
  slug: string,
  page: Page,
  testInfo: TestInfo,
  parentSlug?: string,
): Promise<number> => {
  await clickSideNavItem(page, slug, parentSlug);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
    .analyze();

  const passed = results.passes?.length ?? 0;
  const violations = results.violations?.length ?? 0;
  const incomplete = results.incomplete?.length ?? 0;
  const total = passed + violations + incomplete;
  const percent = total === 0 ? 100 : (passed / total) * 100;

  const severities = countSeverities(results);
  const testName = testInfo.title;

  printSummary(
    percent,
    passed,
    violations,
    incomplete,
    slug,
    testName,
    severities,
  );

  if (results.violations.length > 0) {
    const result = generateResult(results, "violation", slug);
    console.log(result);
  }

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "_");

    const report = {
      meta: {
        slug,
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

    const filename = `a11y-${slug.toLowerCase()}-${timestamp}.json`;
    const outPath = testInfo.outputPath(filename);
    await writeFile(outPath, JSON.stringify(report, null, 2), "utf8");

    await testInfo.attach(filename, {
      path: outPath,
      contentType: "application/json",
    });
  } catch (err) {
    console.error("Failed to write/attach a11y report:", err);
  }

  return percent;
};
