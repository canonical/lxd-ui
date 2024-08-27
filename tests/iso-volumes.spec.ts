import { test, expect } from "./fixtures/lxd-test";
import { randomNameSuffix } from "./helpers/name";
import { deleteInstance, randomInstanceName } from "./helpers/instances";
import { assertTextVisible } from "./helpers/permissions";
import { activateOverride } from "./helpers/configuration";

const ISO_FILE = "./tests/fixtures/foo.iso";

export const randomIso = (): string => {
  return `playwright-iso-${randomNameSuffix()}`;
};

test("upload and delete custom iso", async ({ page, lxdVersion }) => {
  test.skip(
    lxdVersion === "5.0-edge",
    "custom storage volume iso import not supported in lxd v5.0/edge",
  );
  const isoName = randomIso();

  await page.goto("/ui/");
  await page.getByRole("button", { name: "Storage", exact: true }).click();
  await page.getByRole("link", { name: "Custom ISOs" }).click();
  await page.getByRole("button", { name: "Upload custom ISO" }).click();
  await page.getByLabel("Local file").setInputFiles(ISO_FILE);
  await page.getByLabel("Alias").fill(isoName);

  await page.getByRole("button", { name: "Upload", exact: true }).click();
  await assertTextVisible(page, `Image ${isoName} uploaded successfully`);

  await page.getByPlaceholder("Search for custom ISOs").fill(isoName);
  await page.getByRole("button", { name: "Create instance" }).click();

  await page.getByText("YAML configuration").click();
  await assertTextVisible(page, "devices:", true);
  await assertTextVisible(page, "iso-volume:", true);
  await assertTextVisible(page, "boot.priority: '10'", true);
  await assertTextVisible(page, `source: ${isoName}`, true);
  await assertTextVisible(page, "type: disk", true);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();

  await page.getByPlaceholder("Search for custom ISOs").fill(isoName);
  await assertTextVisible(page, "3 B");
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByText("Delete", { exact: true }).click();
  await assertTextVisible(page, `Custom iso ${isoName} deleted.`);
});

test("use custom iso for instance launch", async ({ page, lxdVersion }) => {
  test.skip(
    lxdVersion === "5.0-edge",
    "custom storage volume iso import not supported in lxd v5.0/edge",
  );

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
  await page
    .locator(".u-align--right > .p-button--positive", { hasText: "Select" })
    .click();
  await page.getByText("Migration").click();
  await activateOverride(page, "Stateful migration");
  await page
    .getByRole("combobox", { name: "Stateful migration" })
    .selectOption("Deny");
  await page.getByRole("button", { name: "Create" }).click();

  await page.waitForSelector(`text=Created instance ${instance}.`);

  await deleteInstance(page, instance);
  await page.goto("/ui/");
  await page.getByRole("button", { name: "Storage", exact: true }).click();
  await page.getByRole("link", { name: "Custom ISOs" }).click();
  await page.getByPlaceholder("Search for custom ISOs").fill(isoName);
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByText("Delete", { exact: true }).click();
  await assertTextVisible(page, `Custom iso ${isoName} deleted.`);
});

test("not allowed to upload custom iso for lxd v5.0/edge", async ({
  page,
  lxdVersion,
}) => {
  test.skip(
    lxdVersion !== "5.0-edge",
    `this test is specific to lxd v5.0/edge, current lxd snap channel is ${lxdVersion}`,
  );
  await page.goto("/ui/");
  await page.getByRole("button", { name: "Storage", exact: true }).click();
  await expect(page.getByRole("link", { name: "Custom ISOs" })).toBeHidden();
});

test("not allowed to launch instance with custom iso for lxd v5.0/edge", async ({
  page,
  lxdVersion,
}) => {
  test.skip(Boolean(process.env.CI), "github runners lack vm support");
  test.skip(
    lxdVersion !== "5.0-edge",
    `this test is specific to lxd v5.0/edge, current lxd snap channel is ${lxdVersion}`,
  );

  const instance = randomInstanceName();
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Instances", exact: true }).click();
  await page.getByRole("button", { name: "Create instance" }).click();
  await page.getByLabel("Instance name").fill(instance);
  await expect(
    page.getByRole("button", { name: "Use custom ISO" }),
  ).toBeHidden();
});
