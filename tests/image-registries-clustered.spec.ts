import { expect, test } from "./fixtures/lxd-test";
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
  createAndValidateLxdRegistry,
  createImageRegistry,
  randomImageRegistryName,
  deleteImageRegistry,
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

test("create private LXD image registry with a bidirectional cluster link", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfImageRegistriesNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const cluster = randomLinkName();
  await visitClusterLinks(page);
  await createClusterLinkBidirectional(page, cluster);

  await createAndValidateLxdRegistry(page, cluster);
  await visitClusterLinks(page);
  await deleteClusterLink(page, cluster);
});

test("create private LXD image registry with a unidirectional cluster link", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfImageRegistriesNotSupported(lxdVersion);
  skipIfUnidirectionalClusterLinksNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const cluster = randomLinkName();
  await visitClusterLinks(page);
  const token = createIdentityOnRemoteCluster(cluster);
  await createClusterLinkUnidirectional(page, cluster, token);

  await createAndValidateLxdRegistry(page, cluster);
  deleteIdentityOnRemoteCluster(cluster);
  await visitClusterLinks(page);
  await deleteClusterLink(page, cluster);
});

test("LXD image registry can access and use images from a remote project", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfImageRegistriesNotSupported(lxdVersion);
  skipIfUnidirectionalClusterLinksNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

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
    // Prepare a remote project with an image to expose through the registry.
    runCommand(`lxc exec ${remoteVm} -- lxc project create ${remoteProject}`);
    remoteProjectCreated = true;

    runCommand(
      `lxc exec ${remoteVm} -- lxc image copy images:alpine/3.23/cloud local: --target-project=${remoteProject} --alias=${remoteImage}`,
    );
    remoteImageCreated = true;

    // Connect the clusters.
    const token = createClusterLinkOnRemoteCluster(link);
    remoteLinkCreated = true;
    await visitClusterLinks(page);
    await createClusterLinkBidirectional(page, link, token);
    localLinkCreated = true;

    // Point the local registry at the remote project through the cluster link.
    await createImageRegistry(page, localRegistry, "LXD", {
      cluster: link,
      sourceProject: remoteProject,
    });
    localRegistryCreated = true;

    // Verify the remote image is listed and the source project is correct.
    await visitImageRegistry(page, localRegistry);
    const imageRow = page.getByRole("row").filter({ hasText: remoteImage });
    await expect(imageRow).toBeVisible();
    await page.getByTestId("tab-link-Configuration").click();
    await validateRegistryDetailRow(page, "Source project", remoteProject);
    await page.getByTestId("tab-link-Images").click();

    // Create a local instance from the registry image and confirm it starts.
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
    // Clean up.
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
      runCommand(
        `lxc exec ${remoteVm} -- lxc image delete ${remoteImage} --project=${remoteProject}`,
      );
    }
    if (remoteProjectCreated) {
      runCommand(`lxc exec ${remoteVm} -- lxc project delete ${remoteProject}`);
    }
  }
});
