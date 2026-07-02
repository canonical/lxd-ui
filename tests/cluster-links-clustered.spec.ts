import { test, expect } from "./fixtures/lxd-test";
import {
  createClusterLink,
  deleteClusterLink,
  editClusterLink,
  randomLinkName,
  skipIfClusterLinksNotSupported,
  createClusterLinkOnRemoteCluster,
  deleteClusterLinkOnRemoteCluster,
  visitClusterLinks,
} from "./helpers/cluster-links";
import { skipIfNotClustered } from "./helpers/cluster";

test("cluster link create edit delete", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfClusterLinksNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const link = randomLinkName();
  await visitClusterLinks(page);
  await createClusterLink(page, link);
  const row = page.getByRole("row").filter({ hasText: link });
  await expect(row).toBeVisible();
  await expect(row.getByRole("cell", { name: "Type" })).toHaveText(
    "Bidirectional",
  );
  await expect(row.getByRole("cell", { name: "Status" })).toHaveText("Pending");
  await expect(row.getByRole("cell", { name: "Addresses" })).toHaveText("-");
  await expect(row.getByRole("cell", { name: "Description" })).toHaveText("");

  await editClusterLink(page, link);
  await expect(row.getByRole("cell", { name: "Description" })).toHaveText(
    "My link",
  );

  await deleteClusterLink(page, link);
  await expect(row).toHaveCount(0);
});

test("cluster link table displays all links", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfClusterLinksNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const link1 = randomLinkName();
  const link2 = randomLinkName();
  await visitClusterLinks(page);
  await createClusterLink(page, link1);
  await createClusterLink(page, link2);

  const row1 = page.getByRole("row").filter({ hasText: link1 });
  const row2 = page.getByRole("row").filter({ hasText: link2 });

  await expect(row1).toBeVisible();
  await expect(row2).toBeVisible();

  await deleteClusterLink(page, link1);
  await deleteClusterLink(page, link2);
});

test("consume token to create cluster link", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfClusterLinksNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const link = randomLinkName();
  await visitClusterLinks(page);

  const token = createClusterLinkOnRemoteCluster(link);
  await createClusterLink(page, link, token);

  const row = page.getByRole("row").filter({ hasText: link });
  await expect(row.getByRole("cell", { name: "Status" })).toHaveText(
    "Reachable",
  );
  await expect(row.getByRole("cell", { name: "Auth groups" })).toHaveText("1");

  deleteClusterLinkOnRemoteCluster(link);
  await deleteClusterLink(page, link);
});
