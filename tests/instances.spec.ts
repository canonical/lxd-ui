import { test, expect, Page } from "@playwright/test";

test("instance create and remove", async ({ page }) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);
  await deleteInstance(page, instance);
});

test("snapshot create restore and remove ", async ({ page }) => {
  const instance = randomInstanceName();
  const snapshot = randomSnapshotName();
  await createInstance(page, instance);
  await openInstanceDetail(page, instance);
  await createSnapshot(page, instance, snapshot);
  await expect(page.getByText(`Snapshot ${snapshot} created.`)).toBeVisible();

  await restoreSnapshot(page, snapshot);
  await expect(page.getByText("Snapshot restored.")).toBeVisible();

  await deleteSnapshot(page, snapshot);
  await expect(page.getByText("Snapshot deleted.")).toBeVisible();

  await deleteInstance(page, instance);
});

const randomInstanceName = (): string => {
  const r = (Math.random() + 1).toString(36).substring(7);
  return `playwright-instance-${r}`;
};

const randomSnapshotName = (): string => {
  const r = (Math.random() + 1).toString(36).substring(7);
  return `playwright-snapshot-${r}`;
};

const createInstance = async (page: Page, instanceName: string) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add instance" }).click();
  await page.getByRole("button", { name: "Quick create instance" }).click();
  await page.getByLabel("Instance name").click();
  await page.getByLabel("Instance name").fill(instanceName);
  await page.getByRole("button", { name: "Select image" }).click();
  await page
    .getByPlaceholder("Search for distributions, releases or or aliases")
    .click();
  await page
    .getByPlaceholder("Search for distributions, releases or or aliases")
    .fill("lts");
  await page
    .getByRole("row", {
      name: "Distribution Release Architecture Alias Action",
    })
    .getByRole("button", { name: "Select" })
    .click();
  await page.getByRole("button", { name: "Create instance" }).click();
};

const deleteInstance = async (page: Page, instanceName: string) => {
  await openInstanceDetail(page, instanceName);
  await page.keyboard.down("Shift");
  await page.getByRole("button", { name: "Delete Delete" }).click();
  await page.keyboard.up("Shift");

  const deleteFailed = await page
    .getByText("Error on instance delete")
    .isVisible({ timeout: 1000 });
  if (deleteFailed) {
    await page.waitForTimeout(1000);
    await deleteInstance(page, instanceName);
    return;
  }

  await expect(page.getByText(`Add instance`)).toBeVisible();
};

const openInstanceDetail = async (page: Page, instanceName: string) => {
  await page.goto(`/instances/${instanceName}`);
  await expect(page.getByText(`Stopped`)).toBeVisible();
};

const createSnapshot = async (
  page: Page,
  instance: string,
  snapshot: string
) => {
  await page.getByTestId("tab-link-Snapshots").click();
  await page.getByRole("button", { name: "Create snapshot" }).click();
  await page.getByLabel("Snapshot name").click();
  await page.getByLabel("Snapshot name").fill(snapshot);
  await page
    .getByRole("dialog", {
      name: `Create snapshot for ${instance}`,
    })
    .getByRole("button", { name: "Create snapshot" })
    .click();
};

const restoreSnapshot = async (page: Page, snapshot: string) => {
  await page
    .getByRole("row", { name: "Name" })
    .filter({ hasText: snapshot })
    .getByRole("button", { name: "Restore Restore" })
    .click();
  await page
    .getByRole("dialog", { name: "Confirm restore" })
    .getByRole("button", { name: "Restore" })
    .click();
};

const deleteSnapshot = async (page: Page, snapshot: string) => {
  await page
    .getByRole("row", { name: "Name" })
    .filter({ hasText: snapshot })
    .getByRole("button", { name: "Delete Delete" })
    .click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
};
