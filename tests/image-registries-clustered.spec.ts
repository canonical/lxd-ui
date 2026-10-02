import { expect, test } from "./fixtures/lxd-test";
import type { Page } from "@playwright/test";
import { getRemoteClusterVm, skipIfNotClustered } from "./helpers/cluster";
import {
  createClusterLinkBidirectional,
  createClusterLinkUnidirectional,
  createClusterLinkOnRemoteCluster,
  createIdentityOnRemoteCluster,
  deleteClusterLink,
  deleteClusterLinkOnRemoteCluster,
  deleteIdentityOnRemoteCluster,
  randomLinkName,
  skipIfUnidirectionalClusterLinksNotSupported,
  visitClusterLinks,
} from "./helpers/cluster-links";
import {
  skipIfImageRegistriesNotSupported,
  createImageRegistry,
  randomImageRegistryName,
  deleteImageRegistry,
  validateRegistryRow,
  validateRegistryDetailRow,
  visitImageRegistry,
} from "./helpers/image-registries";
import {
  deleteInstance,
  randomImageName,
  randomInstanceName,
} from "./helpers/instances";
import { randomProjectName } from "./helpers/projects";
import { runCommand } from "./helpers/shell";

const runOnCluster = (vm: string, command: string): string =>
  runCommand(`lxc exec ${vm} -- ${command}`);

const createAndValidateLxdRegistry = async (
  page: Page,
  clusterName: string,
) => {
  const projectName = "default";
  const registryName = randomImageRegistryName();
  await createImageRegistry(page, registryName, "LXD", {
    cluster: clusterName,
    sourceProject: projectName,
  });

  await validateRegistryRow(
    page,
    registryName,
    "Protocol",
    `lxdCluster: ${clusterName} Project: ${projectName}`,
  );
  await validateRegistryRow(page, registryName, "Built-in", "No");
  await validateRegistryRow(page, registryName, "Public", "No");

  await deleteImageRegistry(page, registryName);
};

test("create private LXD image registries with unidirectional and bidirectional cluster links", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfImageRegistriesNotSupported(lxdVersion);
  skipIfUnidirectionalClusterLinksNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const clusterName = randomLinkName();
  await visitClusterLinks(page);
  await createClusterLinkBidirectional(page, clusterName);

  await createAndValidateLxdRegistry(page, clusterName);
  await visitClusterLinks(page);
  await deleteClusterLink(page, clusterName);

  const unidirectionalClusterName = randomLinkName();
  await visitClusterLinks(page);
  const token = createIdentityOnRemoteCluster(unidirectionalClusterName);
  await createClusterLinkUnidirectional(page, unidirectionalClusterName, token);

  await createAndValidateLxdRegistry(page, unidirectionalClusterName);
  deleteIdentityOnRemoteCluster(unidirectionalClusterName);
  await visitClusterLinks(page);
  await deleteClusterLink(page, unidirectionalClusterName);
});

test("LXD image registry shows images from a remote project", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfImageRegistriesNotSupported(lxdVersion);
  skipIfUnidirectionalClusterLinksNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);
  test.setTimeout(240_000);

  const remoteVm = getRemoteClusterVm();
  const link = randomLinkName();
  const remoteProject = randomProjectName();
  const remoteImage = randomImageName();
  const localRegistry = randomImageRegistryName();
  const instance = randomInstanceName();
  let remoteLinkCreated = false;
  let localLinkCreated = false;
  let remoteProjectCreated = false;
  let remoteImageCreated = false;
  let localRegistryCreated = false;
  let instanceCreated = false;

  try {
    runOnCluster(remoteVm, `lxc project create ${remoteProject}`);
    remoteProjectCreated = true;

    runOnCluster(
      remoteVm,
      `lxc image copy images:alpine/3.23/cloud local: --target-project=${remoteProject} --alias=${remoteImage}`,
    );
    remoteImageCreated = true;

    const token = createClusterLinkOnRemoteCluster(link);
    remoteLinkCreated = true;
    await visitClusterLinks(page);
    await createClusterLinkBidirectional(page, link, token);
    localLinkCreated = true;

    await createImageRegistry(page, localRegistry, "LXD", {
      cluster: link,
      sourceProject: remoteProject,
    });
    localRegistryCreated = true;
    await visitImageRegistry(page, localRegistry);
    const imageRow = page.getByRole("row").filter({ hasText: remoteImage });
    await expect(imageRow).toBeVisible();
    await page.getByTestId("tab-link-Configuration").click();
    await validateRegistryDetailRow(page, "Source project", remoteProject);
    await page.getByTestId("tab-link-Images").click();
    await imageRow.getByRole("button", { name: "Create instance" }).click();
    await expect(page).toHaveURL(/\/ui\/project\/default\/instances\/create$/);
    await expect(page.locator(".base-image .image-name")).toContainText(
      "Alpine 3.23",
    );

    await page.getByLabel("Instance name").fill(instance);
    await page.getByRole("button", { name: "Create and start" }).click();
    await expect(
      page.getByText(`Created and started instance ${instance}.`),
    ).toBeVisible();
    instanceCreated = true;
  } finally {
    if (instanceCreated) {
      await deleteInstance(page, instance);
    }
    if (localRegistryCreated) {
      await deleteImageRegistry(page, localRegistry);
    }
    if (localLinkCreated) {
      await visitClusterLinks(page);
      await deleteClusterLink(page, link);
    }
    if (remoteLinkCreated) {
      deleteClusterLinkOnRemoteCluster(link);
    }
    if (remoteImageCreated) {
      runOnCluster(
        remoteVm,
        `lxc image delete ${remoteImage} --project=${remoteProject}`,
      );
    }
    if (remoteProjectCreated) {
      runOnCluster(remoteVm, `lxc project delete ${remoteProject}`);
    }
  }
});
