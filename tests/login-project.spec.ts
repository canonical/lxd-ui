import { test, expect } from "./fixtures/lxd-test";
import { dismissNotification } from "./helpers/notification";
import {
  createProject,
  deleteProject,
  randomProjectName,
} from "./helpers/projects";
import { visitServerSettings } from "./helpers/server";
import { gotoURL } from "./helpers/navigate";

const SETTING_NAME = "user.ui_login_project";

test("opening /ui redirects to the configured login project", async ({
  page,
}) => {
  const project = randomProjectName();
  await createProject(page, project);

  await visitServerSettings(page);
  const settingRow = page.getByRole("row").filter({
    has: page.getByText("user.ui_login_project"),
  });
  await settingRow.getByRole("button").click();
  await settingRow
    .getByRole("combobox", { name: SETTING_NAME })
    .selectOption({ label: project });
  await settingRow.getByRole("button", { name: "Save", exact: true }).click();
  await dismissNotification(page, `Setting ${SETTING_NAME} updated.`);

  await gotoURL(page, "/ui/");
  await expect(page).toHaveURL(new RegExp(`/ui/project/${project}/instances`));

  await visitServerSettings(page);
  await settingRow.getByRole("button").click();
  await settingRow
    .getByRole("button", { name: "Reset to default", exact: true })
    .click();
  await settingRow.getByRole("button", { name: "Save", exact: true }).click();
  await dismissNotification(page, `Setting ${SETTING_NAME} updated.`);

  await deleteProject(page, project);
  await gotoURL(page, "/ui/");
  await expect(page).toHaveURL(new RegExp(`/ui/project/default/instances`));
});
