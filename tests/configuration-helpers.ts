import { Page } from "@playwright/test";
import { TIMEOUT } from "./constants";

export async function setOption(page: Page, field: string, value: string) {
  await page.getByRole("row", { name: field }).locator("span").first().click();
  await page.getByRole("combobox", { name: field }).selectOption(value);
}

export async function setInput(
  page: Page,
  field: string,
  placeholder: string,
  value: string
) {
  await page.getByRole("row", { name: field }).locator("span").first().click();
  await page
    .getByRole("row", { name: field })
    .locator("xpath=//input[@type='text' or @type='number']")
    .click();
  await page.getByPlaceholder(placeholder).last().fill(value);
}

export async function setCodeInput(page: Page, field: string, value: string) {
  await page.getByRole("row", { name: field }).locator("span").first().click();
  await page.getByRole("row", { name: field }).locator(".view-lines").click();
  await page.keyboard.type(value);
}

export async function assertCode(page: Page, field: string, value: string) {
  await page.getByRole("row", { name: field }).locator(".view-lines").click();
  await page.getByText(value).click();
}

export async function setCpuLimit(
  page: Page,
  type: "fixed" | "number",
  limit: string
) {
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Resource limits").click();
  await page.getByRole("button", { name: "Edit profile" }).click();
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
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Resource limits").click();
  await page.getByRole("gridcell", { name: `Exposed CPUs ${limit}` }).click();
}

export async function setMemLimit(
  page: Page,
  type: "fixed" | "number",
  limit: string
) {
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Resource limits").click();
  await page.getByRole("button", { name: "Edit profile" }).click();
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
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForSelector(`text=Profile updated.`, TIMEOUT);

  const unit = type === "number" ? "%" : "GiB";
  await page
    .getByRole("gridcell", { name: `Memory limit ${limit}${unit}` })
    .click();
}

export async function assertReadMode(page: Page, text: string) {
  await page
    .getByRole("gridcell", {
      name: text,
    })
    .click();
}
