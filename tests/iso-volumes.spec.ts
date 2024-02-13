import { test } from "@playwright/test";
import { randomNameSuffix } from "./helpers/name";
import { deleteInstance, randomInstanceName } from "./helpers/instances";

const ISO_FILE = "./tests/fixtures/foo.iso";

export const randomIso = (): string => {
  return `playwright-iso-${randomNameSuffix()}`;
};

test("upload and delete custom iso", async ({ page }) => {
  const isoName = randomIso();

  await page.goto("/ui/");
  await page.getByRole("link", { name: "Storage", exact: true }).click();
  await page.getByTestId("tab-link-Custom ISOs").click();
  await page.getByRole("button", { name: "Upload custom ISO" }).click();
  await page.getByLabel("Local file").setInputFiles(ISO_FILE);
  await page.getByLabel("Alias").fill(isoName);

  await page.getByRole("button", { name: "Upload", exact: true }).click();
  await page.getByText(`Image ${isoName} uploaded successfully`).click();

  await page.getByPlaceholder("Search for custom ISOs").fill(isoName);
  await page.getByRole("button", { name: "Create instance" }).click();

  await page.getByText("YAML configuration").click();
  await page.getByText("devices:", { exact: true }).click();
  await page.getByText("iso-volume:", { exact: true }).click();
  await page.getByText("boot.priority: '10'", { exact: true }).click();
  await page.getByText(`source: ${isoName}`, { exact: true }).click();
  await page.getByText("type: disk", { exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();

  await page.getByPlaceholder("Search for custom ISOs").fill(isoName);
  await page.getByText("3 B").click();
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByText("Delete", { exact: true }).click();
  await page.getByText(`Custom iso ${isoName} deleted.`).click();
});

test("use custom iso for instance launch", async ({ page }) => {
  test.skip(Boolean(process.env.CI), "github runners lack vm support");

  const instance = randomInstanceName();
  const isoName = randomIso();

  await page.goto("/ui/");
  await page.getByRole("link", { name: "Instances", exact: true }).click();
  await page.getByRole("button", { name: "Create instance" }).click();
  await page.getByLabel("Instance name").fill(instance);
  await page.getByRole("button", { name: "Use custom ISO" }).click();
  await page.getByRole("button", { name: "Upload custom ISO" }).click();
  await page.getByLabel("Local file").setInputFiles(ISO_FILE);
  await page
    .getByRole("dialog", { name: "Upload custom ISO" })
    .locator("#name")
    .fill(isoName);
  await page.getByRole("button", { name: "Upload", exact: true }).click();
  await page.locator(".u-align--right > .p-button--positive").click();
  await page.getByRole("button", { name: "Create" }).click();

  await page.waitForSelector(`text=Created instance ${instance}.`);

  await deleteInstance(page, instance);
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Storage", exact: true }).click();
  await page.getByTestId("tab-link-Custom ISOs").click();
  await page.getByPlaceholder("Search for custom ISOs").fill(isoName);
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByText("Delete", { exact: true }).click();
  await page.getByText(`Custom iso ${isoName} deleted.`).click();
});
