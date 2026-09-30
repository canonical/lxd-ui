import { test } from "./fixtures/lxd-test";
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
  createAndValidateLxdRegistry,
} from "./helpers/image-registries";

test("create private LXD image registry with a bidirectional cluster link", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfImageRegistriesNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const clusterName = randomLinkName();
  await visitClusterLinks(page);
  await createClusterLinkBidirectional(page, clusterName);

  await createAndValidateLxdRegistry(page, clusterName);
  await visitClusterLinks(page);
  await deleteClusterLink(page, clusterName);
});

test("create private LXD image registry with a unidirectional cluster link", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfImageRegistriesNotSupported(lxdVersion);
  skipIfUnidirectionalClusterLinksNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const unidirectionalClusterName = randomLinkName();
  await visitClusterLinks(page);
  const token = createIdentityOnRemoteCluster(unidirectionalClusterName);
  await createClusterLinkUnidirectional(page, unidirectionalClusterName, token);

  await createAndValidateLxdRegistry(page, unidirectionalClusterName);
  deleteIdentityOnRemoteCluster(unidirectionalClusterName);
  await visitClusterLinks(page);
  await deleteClusterLink(page, unidirectionalClusterName);
});
