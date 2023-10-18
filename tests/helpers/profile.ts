import { Page } from "@playwright/test";
import { TIMEOUT } from "./constants";
import { randomNameSuffix } from "./name";

export const randomProfileName = (): string => {
  return `playwright-profile-${randomNameSuffix()}`;
};

export const createProfile = async (page: Page, profile: string) => {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Profiles" }).click();
  await page.getByRole("button", { name: "Create profile" }).click();
  await page.getByLabel("Profile name").click();
  await page.getByLabel("Profile name").fill(profile);
  await page.getByRole("button", { name: "Create" }).click();
  await page.waitForSelector(`text=Profile ${profile} created.`, TIMEOUT);
};

export const deleteProfile = async (page: Page, profile: string) => {
  await visitProfile(page, profile);
  await page.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForSelector(`text=Profile ${profile} deleted.`, TIMEOUT);
};

export const visitProfile = async (page: Page, profile: string) => {
  await page.goto("/ui/");
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
  await page
    .getByRole("listitem", { name: oldName })
    .getByText(oldName)
    .click();
  await page.getByRole("textbox").press("Control+a");
  await page.getByRole("textbox").fill(newName);
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByText("Profile renamed.").click();
};

export const saveProfile = async (page: Page) => {
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForSelector(`text=Profile updated.`, TIMEOUT);
};

export const editProfile = async (page: Page, profile: string) => {
  await visitProfile(page, profile);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByRole("button", { name: "Edit profile" }).click();
};
