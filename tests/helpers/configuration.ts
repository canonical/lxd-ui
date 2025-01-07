import { Page } from "@playwright/test";
import { expect, LxdVersions } from "../fixtures/lxd-test";

export const setOption = async (page: Page, field: string, value: string) => {
  await activateOverride(page, field);
  await page.getByRole("combobox", { name: field }).selectOption(value);
};

export const setInput = async (
  page: Page,
  field: string,
  placeholder: string,
  value: string,
) => {
  await activateOverride(page, field);
  await page
    .getByRole("row", { name: field })
    .locator("xpath=//input[@type='text' or @type='number']")
    .click();
  await page.getByPlaceholder(placeholder).last().fill(value);
};

export const setTextarea = async (page: Page, field: string, value: string) => {
  await activateOverride(page, field);
  await page.getByRole("row", { name: field }).getByRole("textbox").click();
  await page.getByRole("textbox", { name: field }).fill(value);
};

export const setCodeInput = async (
  page: Page,
  field: string,
  value: string,
) => {
  await activateOverride(page, field);
  await page
    .getByRole("row", { name: field })
    .locator(".override .view-lines")
    .click();
  await page.keyboard.type(value);
};

export const assertCode = async (page: Page, field: string, value: string) => {
  await page
    .getByRole("row", { name: field })
    .locator(".override .view-lines")
    .click();
  await page.getByText(value).click();
};

export const setCpuLimit = async (
  page: Page,
  type: "fixed" | "number",
  limit: string,
) => {
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Resource limits").click();
  const row = page.getByRole("row", { name: "Exposed CPU limit" });
  await expect(row).toBeVisible();
  await row.getByRole("button").click();
  await page.getByText(type).first().click();
  const placeholder =
    type === "fixed"
      ? "Comma-separated core numbers"
      : "Number of exposed cores";
  await page.getByPlaceholder(placeholder).click();
  await page.getByPlaceholder(placeholder).press("Control+a");
  await page.getByPlaceholder(placeholder).fill(limit);
};

export const clearCpuLimit = async (page: Page) => {
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Resource limits").click();
  const row = page.getByRole("row", { name: "Exposed CPU limit" });
  await expect(row).toBeVisible();
  await row.getByRole("button").click();
  await clearOverride(page, "Exposed CPU limit");
};

export const setMemLimit = async (
  page: Page,
  type: "absolute" | "percentage",
  limit: string,
) => {
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Resource limits").click();
  const row = page.getByRole("row", { name: "Memory limit" });
  await expect(row).toBeVisible();
  await row.getByRole("button").click();
  await row.getByText(type).click();
  const text = type === "percentage" ? "Enter percentage" : "Enter value";
  await page.getByPlaceholder(text).click();
  await page.getByPlaceholder(text).press("Control+a");
  await page.getByPlaceholder(text).fill(limit);
};

export const setSchedule = async (
  page: Page,
  value: string,
  lxdVersion: LxdVersions,
) => {
  const scheduleFieldText =
    lxdVersion === "5.0-edge"
      ? "Schedule"
      : "Schedule Schedule for automatic instance snapshots - From: LXD";

  await activateOverride(page, scheduleFieldText);
  await page
    .getByRole("row", {
      name: scheduleFieldText,
    })
    .getByText("Cron syntax")
    .click();
  await page.getByPlaceholder("Enter cron expression").last().fill(value);
};

export const activateOverride = async (page: Page, field: string) => {
  const row = page.getByRole("row", { name: field }).first();
  await expect(row).toBeVisible();

  const overrideBtn = row.getByRole("button", { name: "Create override" });
  if (await overrideBtn.isVisible()) {
    await overrideBtn.click();
  }
};

export const clearOverride = async (page: Page, field: string) => {
  const clearBtn = page
    .getByRole("row", { name: field })
    .getByRole("button", { name: "Clear override" });

  if (await clearBtn.isVisible()) {
    await clearBtn.click();
  }
};

export const assertReadMode = async (
  page: Page,
  field: string,
  value: string,
) => {
  await page
    .getByRole("row", { name: field })
    .getByRole("gridcell", { name: value, exact: true })
    .getByText(value)
    .click();
};

export const activateAllTableOverrides = async (page: Page) => {
  const overrideButtons = await page
    .locator('td[role="gridcell"].override button')
    .all();

  for (const button of overrideButtons) {
    await button.click();
  }
};

export const checkAllOptions = async (
  page: Page,
  name: string,
  options: string[],
) => {
  await activateOverride(page, name);
  for (const option of options) {
    await page.getByRole("combobox", { name: name }).selectOption(option);
  }
};
