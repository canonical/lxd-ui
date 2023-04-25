import { Page } from "@playwright/test";

export const setOption = async (page: Page, field: string, value: string) => {
  await page.getByRole("row", { name: field }).locator("span").first().click();
  await page.getByRole("combobox", { name: field }).selectOption(value);
};

export const setInput = async (
  page: Page,
  field: string,
  placeholder: string,
  value: string
) => {
  await page.getByRole("row", { name: field }).locator("span").first().click();
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
  await page.getByRole("row", { name: field }).locator("span").first().click();
  await page.getByRole("row", { name: field }).getByRole("textbox").click();
  await page.getByRole("textbox", { name: field }).fill(value);
};

export const setCodeInput = async (
  page: Page,
  field: string,
  value: string
) => {
  await page.getByRole("row", { name: field }).locator("span").first().click();
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
  if (
    !(await page
      .getByRole("row", { name: "Exposed CPUs" })
      .locator("input")
      .first()
      .isChecked())
  ) {
    await page
      .getByRole("row", { name: "Exposed CPUs" })
      .locator("span")
      .first()
      .click();
  }
  await page.getByText(type).click();
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
  type: "fixed" | "number",
  limit: string
) => {
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Resource limits").click();
  await page.getByRole("button", { name: "Edit" }).click();
  if (
    !(await page
      .getByRole("row", { name: "Memory limit" })
      .locator("input")
      .first()
      .isChecked())
  ) {
    await page
      .getByRole("row", { name: "Memory limit" })
      .locator("span")
      .first()
      .click();
  }
  await page
    .getByRole("gridcell", { name: "Memory limit" })
    .getByText(type)
    .click();
  const text = type === "number" ? "Enter percentage" : "Enter value";
  await page.getByPlaceholder(text).click();
  await page.getByPlaceholder(text).press("Control+a");
  await page.getByPlaceholder(text).fill(limit);
};

export const setSchedule = async (page: Page, value: string) => {
  await page
    .getByRole("row", { name: "Schedule - LXD" })
    .locator("span")
    .first()
    .click();
  await page
    .getByRole("row", { name: "Schedule Cron syntax" })
    .locator("xpath=//input[@type='text' or @type='number']")
    .click();
  await page.getByPlaceholder("Enter cron expression").last().fill(value);
};

export const assertReadMode = async (page: Page, text: string) => {
  await page
    .getByRole("gridcell", {
      name: text,
    })
    .click();
};
