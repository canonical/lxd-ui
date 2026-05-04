import { test } from "./fixtures/lxd-test";
import { skipIfNotClustered } from "./helpers/cluster";
import { createClusterLink, randomLinkName } from "./helpers/cluster-links";
import {
  skipIfNotSupported,
  createImageRegistry,
  randomImageRegistryName,
  deleteImageRegistry,
  validateRegistryRow,
} from "./helpers/image-registries";

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
});
