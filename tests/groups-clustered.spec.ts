import { test, expect } from "./fixtures/lxd-test";
import {
  createClusterGroup,
  deleteClusterGroup,
  getFirstClusterMember,
  randomGroupName,
  skipIfNotClustered,
  skipIfNotSupported,
  toggleClusterGroupMember,
} from "./helpers/cluster";

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
    page.getByRole("row", { name: group }).getByText("1"),
  ).toBeVisible();

  await toggleClusterGroupMember(page, group, member);

  await expect(
    page.getByRole("row", { name: group }).getByText("0"),
  ).toBeVisible();

  await deleteClusterGroup(page, group);
});
