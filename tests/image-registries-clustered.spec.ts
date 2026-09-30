import { test } from "./fixtures/lxd-test";
import type { Page } from "@playwright/test";
import { skipIfNotClustered } from "./helpers/cluster";
import {
  createClusterLinkBidirectional,
  createClusterLinkUnidirectional,
  createIdentityOnRemoteCluster,
  deleteClusterLink,
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
} from "./helpers/image-registries";
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
