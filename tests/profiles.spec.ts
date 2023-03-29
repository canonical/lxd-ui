import { Page, test } from "@playwright/test";
import { TIMEOUT } from "./constants";

test("profile create and remove", async ({ page }) => {
  const profile = randomProfileName();
  await createProfile(page, profile);
  await deleteProfile(page, profile);
});

test("profile limits", async ({ page }) => {
  const profile = randomProfileName();
  await createProfile(page, profile);

  await page.goto("/ui/");
  await page.getByRole("link", { name: "Profiles" }).click();
  await page.getByRole("link", { name: profile }).first().click();

  await setCpuLimit(page, profile, "number", "42");
  await setCpuLimit(page, profile, "fixed", "1,2,3,4");
  await setCpuLimit(page, profile, "fixed", "1-23");
  await deleteProfile(page, profile);
});

const randomProfileName = (): string => {
  const r = (Math.random() + 1).toString(36).substring(7);
  return `playwright-profile-${r}`;
};

async function createProfile(page: Page, profile: string) {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Profiles" }).click();
  await page.getByRole("button", { name: "Create profile" }).click();
  await page.getByLabel("Profile name").click();
  await page.getByLabel("Profile name").fill(profile);
  await page.getByRole("button", { name: "Create" }).click();
  await page.waitForSelector(`text=Profile ${profile} created.`, TIMEOUT);
}

async function deleteProfile(page: Page, profile: string) {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Profiles" }).click();
  await page.getByRole("link", { name: profile }).first().click();
  await page.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForSelector(`text=Profile ${profile} deleted.`, TIMEOUT);
}

async function setCpuLimit(
  page: Page,
  profile: string,
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
