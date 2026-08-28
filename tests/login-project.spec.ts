import { test, expect } from "./fixtures/lxd-test";
import { dismissNotification } from "./helpers/notification";
import {
  createProject,
  deleteProject,
  randomProjectName,
} from "./helpers/projects";
import { visitAccountPreferences } from "./helpers/account";
import { gotoURL } from "./helpers/navigate";

test("opening /ui redirects to the configured login project", async ({
  page,
}) => {
  const project = randomProjectName();
  await createProject(page, project);

  await visitAccountPreferences(page);
  await page.locator(".readmode-button").click();
  await page
    .getByRole("combobox", { name: "Login project" })
    .selectOption({ label: project });
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await dismissNotification(page, "Login project updated.");

  await gotoURL(page, "/ui/");
  await expect(page).toHaveURL(new RegExp(`/ui/project/${project}/instances`));

  await visitAccountPreferences(page);
  await page.locator(".readmode-button").click();
  await page
    .getByRole("button", { name: "Reset to default", exact: true })
    .click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await dismissNotification(page, "Login project updated.");

  await deleteProject(page, project);
  await gotoURL(page, "/ui/");
  await expect(page).toHaveURL(new RegExp(`/ui/project/default/instances`));
});
