import { Page } from "@playwright/test";

export const setOption = async (page: Page, field: string, value: string) => {
  await activateOverride(page, field);
  await page.getByRole("combobox", { name: field }).selectOption(value);
};

export const setInput = async (
  page: Page,
  field: string,
  placeholder: string,
  value: string
) => {
  await activateOverride(page, field);
  await page
    .getByRole("row", { name: field })
    .locator("xpath=//input[@type='text' or @type='number']")
    .click();
  await page.getByPlaceholder(placeholder).last().fill(value);
};

export const setTextarea = async (
  page: Page,
  field: string,
  placeholder: string,
  value: string
) => {
  await activateOverride(page, field);
  await page.getByRole("row", { name: field }).getByRole("textbox").click();
  await page.getByRole("textbox", { name: field }).fill(value);
};

export const setCodeInput = async (
  page: Page,
  field: string,
  value: string
) => {
  await activateOverride(page, field);
  await page.getByRole("row", { name: field }).locator(".view-lines").click();
  await page.keyboard.type(value);
};

export const assertCode = async (page: Page, field: string, value: string) => {
  await page.getByRole("row", { name: field }).locator(".view-lines").click();
  await page.getByText(value).click();
};

export const setCpuLimit = async (
  page: Page,
  type: "fixed" | "number",
  limit: string
) => {
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Resource limits").click();
  await page.getByRole("button", { name: "Edit" }).click();
  await activateOverride(page, "Exposed CPUs");
  await page.getByText(type).first().click();
  const placeholder =
    type === "fixed"
      ? "Comma-separated core numbers"
      : "Number of exposed cores";
  await page.getByPlaceholder(placeholder).click();
  await page.getByPlaceholder(placeholder).press("Control+a");
  await page.getByPlaceholder(placeholder).fill(limit);
};

export const setMemLimit = async (
  page: Page,
  type: "absolute" | "percentage",
  limit: string
) => {
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Resource limits").click();
  await page.getByRole("button", { name: "Edit" }).click();
  await activateOverride(page, "Memory limit");
  await page
    .getByRole("gridcell", { name: "Memory limit" })
    .getByText(type)
    .click();
  const text = type === "percentage" ? "Enter percentage" : "Enter value";
  await page.getByPlaceholder(text).click();
  await page.getByPlaceholder(text).press("Control+a");
  await page.getByPlaceholder(text).fill(limit);
};

export const setSchedule = async (page: Page, value: string) => {
  await activateOverride(page, "Schedule From: LXD");
  await page
    .getByRole("row", { name: "Schedule" })
    .getByText("Cron syntax")
    .click();
  await page.getByPlaceholder("Enter cron expression").last().fill(value);
};

export const activateOverride = async (page: Page, field: string) => {
  await page.getByRole("row", { name: field }).hover();
  if (
    !(await page
      .getByRole("row", { name: field })
      .getByRole("button", { name: "Clear" })
      .isVisible())
  ) {
    await page
      .getByRole("row", { name: field })
      .getByRole("button", { name: "Override" })
      .click();
  }
};

export const assertReadMode = async (
  page: Page,
  field: string,
  value: string
) => {
  await page.getByRole("row", { name: field }).getByText(value).click();
};
