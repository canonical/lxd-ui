import { expect, test } from "./fixtures/lxd-test";
import { skipIfNotClustered } from "./helpers/cluster";
import { createClusterLink, randomLinkName } from "./helpers/cluster-links";
import {
  skipIfNotSupported,
  visitImageRegistries,
  randomImageRegistryName,
  deleteImageRegistry,
} from "./helpers/image-registries";
import { dismissNotification } from "./helpers/notification";

test("create private LXD image registry", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const clusterName = randomLinkName();
  await createClusterLink(page, clusterName);

  const projectName = "default";
  const registryName = randomImageRegistryName();
  await visitImageRegistries(page);
  await page.getByTitle("Create registry").click();
  await expect(
    page.getByRole("heading", { name: "Create image registry" }),
  ).toBeVisible();

  const sidePanel = page.getByLabel("Side panel");
  await sidePanel.getByPlaceholder("Enter name").fill(registryName);
  await sidePanel.getByLabel("Description").fill("Playwright LXD registry");
  await sidePanel.getByRole("radio", { name: "LXD" }).check({ force: true });

  await expect(sidePanel.getByLabel("Server")).not.toBeVisible();
  await sidePanel.getByLabel("Source project").fill(projectName);
  await sidePanel.getByLabel("Cluster").click();
  await page.getByTitle(clusterName).click();

  await sidePanel.getByRole("button", { name: "Create", exact: true }).click();
  await dismissNotification(page, `Image registry ${registryName} created.`);

  const createdRow = page.getByRole("row").filter({ hasText: registryName });
  await expect(
    createdRow.getByRole("rowheader", { name: "Name" }),
  ).toContainText(registryName);
  await expect(
    createdRow.getByRole("cell", { name: "Protocol" }),
  ).toContainText(`lxdCluster: ${clusterName} Project: ${projectName}`);
  await expect(
    createdRow.getByRole("cell", { name: "Built-in" }),
  ).toContainText("No");
  await expect(createdRow.getByRole("cell", { name: "Public" })).toContainText(
    "No",
  );

  await deleteImageRegistry(page, registryName);
});
