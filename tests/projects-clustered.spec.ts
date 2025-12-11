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
  openProjectConfiguration,
  randomProjectName,
} from "./helpers/projects";

test("project edit configuration", async ({ page, lxdVersion }, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);
  const project = randomProjectName();
  await createProject(page, project);
  await openProjectConfiguration(page);

  await page.getByPlaceholder("Enter description").fill("A-new-description");
  await page.getByText("Allow custom restrictions on a project level").click();

  await page.getByText("Clusters").click();
  await setMultiselectOption(page, "Cluster groups", "default");
  await setOption(page, "Direct cluster targeting", "allow");

  await page.getByRole("button", { name: "Save 4 changes" }).click();
  await page.waitForSelector(`text=Project ${project} updated.`);
  await page.getByRole("button", { name: "Close notification" }).click();

  await page.getByText("Project details").click();

  await assertTextVisible(page, "DescriptionA-new-description");

  await page.getByText("Clusters").click();
  await assertReadMode(page, "Cluster groups targeting", "default");
  await assertReadMode(page, "Direct cluster targeting", "Allow");
  await deleteProject(page, project);
});
