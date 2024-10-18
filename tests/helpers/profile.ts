import { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { gotoURL } from "./navigate";

export const randomProfileName = (): string => {
  return `playwright-profile-${randomNameSuffix()}`;
};

export const createProfile = async (
  page: Page,
  profile: string,
  project: string = "default",
) => {
  await startProfileCreation(page, profile, project);
  await finishProfileCreation(page, profile);
};

export const startProfileCreation = async (
  page: Page,
  profile: string,
  project: string = "default",
) => {
  await gotoURL(page, `/ui/project/${project}`);
  await page.getByRole("link", { name: "Profiles" }).click();
  await page.getByRole("button", { name: "Create profile" }).click();
  await page.getByLabel("Profile name").fill(profile);
};

export const finishProfileCreation = async (page: Page, profile: string) => {
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForSelector(`text=Profile ${profile} created.`);
};

export const deleteProfile = async (
  page: Page,
  profile: string,
  project: string = "default",
) => {
  await visitProfile(page, profile, project);
  await page.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForSelector(`text=Profile ${profile} deleted.`);
};

export const visitProfile = async (
  page: Page,
  profile: string,
  project: string = "default",
) => {
  await gotoURL(page, `/ui/project/${project}`);
  await page.getByRole("link", { name: "Profiles" }).click();
  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill(profile);
  await page.getByRole("link", { name: profile }).first().click();
};

export const renameProfile = async (
  page: Page,
  oldName: string,
  newName: string,
) => {
  await visitProfile(page, oldName);
  await page.locator("li", { hasText: oldName }).click();
  await page.getByRole("textbox").press("Control+a");
  await page.getByRole("textbox").fill(newName);
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForSelector(`text=Profile ${oldName} renamed to ${newName}.`);
};

export const saveProfile = async (
  page: Page,
  profile: string,
  changeCount: number,
) => {
  const name =
    changeCount === 1 ? "Save 1 change" : `Save ${changeCount} changes`;
  await page.getByRole("button", { name }).click();
  await page.waitForSelector(`text=Profile ${profile} updated.`);
  await page.getByRole("button", { name: "Close notification" }).click();
};

export const editProfile = async (page: Page, profile: string) => {
  await visitProfile(page, profile);
  await page.getByTestId("tab-link-Configuration").click();
};
