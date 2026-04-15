import { test, expect } from "./fixtures/lxd-test";
import {
  createClusterGroup,
  deleteClusterGroup,
  randomGroupName,
  skipIfNotSupported,
  toggleClusterGroupMember,
} from "./helpers/cluster-groups";
import { getFirstClusterMember, skipIfNotClustered } from "./helpers/cluster";

test("cluster group create and delete", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);
  const group = randomGroupName();
  await createClusterGroup(page, group);
  await deleteClusterGroup(page, group);
});

test("cluster group add and remove members", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);
  const group = randomGroupName();
  const member = await getFirstClusterMember(page);
  await createClusterGroup(page, group);
  await toggleClusterGroupMember(page, group, member);

  await expect(
    page.getByRole("row", { name: group }).getByText("1", { exact: true }),
  ).toBeVisible();

  await toggleClusterGroupMember(page, group, member);

  await expect(
    page.getByRole("row", { name: group }).getByText("0", { exact: true }),
  ).toBeVisible();

  await deleteClusterGroup(page, group);
});
