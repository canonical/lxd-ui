import { randomNameSuffix } from "./name";
import type { Page } from "@playwright/test";
import { gotoURL } from "./navigate";
import { expect } from "../fixtures/lxd-test";

export const randomProjectName = (): string => {
  return `playwright-project-${randomNameSuffix()}`;
};

const openProjectCreationForm = async (page: Page) => {
  await gotoURL(page, "/ui/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "default" }).click();
  await page.getByRole("button", { name: "Create project" }).click();

  await expect(page.getByText("Project name")).toBeVisible();
  await expect(page.getByText("Loading storage pools")).not.toBeVisible();

  await page.getByLabel("Default profile network").selectOption("No network");
};

const submitProjectCreationForm = async (page: Page, project: string) => {
  await page.getByPlaceholder("Enter name").fill(project);
  await page.getByRole("button", { name: "Create" }).click();
  await page.waitForSelector(`text=Project ${project} created.`);
  await page.getByRole("button", { name: "Close notification" }).click();
};

export const createProject = async (page: Page, project: string) => {
  await openProjectCreationForm(page);
  await submitProjectCreationForm(page, project);
};

export const createCustomProject = async (page: Page, project: string) => {
  await openProjectCreationForm(page);
  await page.getByLabel("Features").selectOption("customised");
  await submitProjectCreationForm(page, project);
};

export const renameProject = async (
  page: Page,
  oldName: string,
  newName: string,
) => {
  await page.getByRole("link", { name: "Configuration" }).click();
  await page.locator("ol li", { hasText: oldName }).click();
  await page.getByRole("textbox").first().press("Control+a");
  await page.getByRole("textbox").first().fill(newName);
  await page.getByRole("button", { name: "Save" }).click();
};

export const deleteProject = async (page: Page, project: string) => {
  await gotoURL(page, "/ui/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "default" }).click();
  await page.getByRole("link", { name: project }).click();
  await page.getByRole("link", { name: "Configuration" }).click();
  await page.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForSelector(`text=Project ${project} deleted.`);
};
