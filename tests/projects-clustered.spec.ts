import { test } from "./fixtures/lxd-test";
import { skipIfNotClustered, skipIfNotSupported } from "./helpers/cluster";
import {
  assertReadMode,
  setMultiselectOption,
  setOption,
} from "./helpers/configuration";
import { assertTextVisible } from "./helpers/permissions";
import {
  createProject,
  deleteProject,
  randomProjectName,
} from "./helpers/projects";

test("project edit configuration", async ({ page, lxdVersion }, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);
  const project = randomProjectName();
  await createProject(page, project);

  await page.getByRole("link", { name: "Configuration" }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000); // Wait for the form state to be fully loaded
  await page.getByPlaceholder("Enter description").fill("A-new-description");

  await page.getByText("Allow custom restrictions on a project level").click();

  await page.getByText("Clusters").click();
  await setMultiselectOption(page, "Cluster groups", "default");
  await setOption(page, "Direct cluster targeting", "allow");

  await page.getByRole("button", { name: "Save 3 changes" }).click();
  await page.waitForSelector(`text=Project ${project} updated.`);
  await page.getByRole("button", { name: "Close notification" }).click();

  await page.getByText("Project details").click();

  await assertTextVisible(page, "DescriptionA-new-description");

  await page.getByText("Clusters").click();
  await assertReadMode(page, "Cluster groups targeting", "default");
  await assertReadMode(page, "Direct cluster targeting", "Allow");
  await deleteProject(page, project);
});
