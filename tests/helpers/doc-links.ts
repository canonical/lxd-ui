import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures/lxd-test";
import { execSync } from "child_process";

export const validateLink = async (
  page: Page,
  linkText: string,
  link: string,
) => {
  await expect(
    page.getByRole("link", { name: linkText, exact: true }).first(),
  ).toHaveAttribute("href", link);
};

export function collectAllDocPaths(): Set<string> {
  const allDocPaths = new Set<string>();

  try {
    const command = `git grep -A2 "<DocLink" | grep 'docPath="'`;
    const output = execSync(command, { encoding: "utf-8" });

    output.split("\n").forEach((line) => {
      const match = line.match(/docPath="([^"]+)"/);
      if (match) {
        allDocPaths.add(match[1]);
      }
    });
  } catch {
    console.warn("No DocLink components found.");
  }

  return allDocPaths;
}

export async function checkDocumentationExists(
  page: Page,
  docPath: string,
): Promise<{
  exists: boolean;
  status?: number;
  error?: string;
}> {
  try {
    const fullUrl = `/documentation${docPath}`;
    const response = await page.request.head(fullUrl);
    const status = response.status();
    const exists = status === 200;
    return { exists, status };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { exists: false, error: errorMessage };
  }
}

export function skipIfNotSupported(lxdVersion: string) {
  test.skip(
    lxdVersion === "5.0-edge",
    "Embedded documentation is not supported in LXD 5.0 and older; skipping link validation.",
  );
}
