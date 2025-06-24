import { test } from "./fixtures/lxd-test";
import {
  createNetworkAcl,
  deleteNetworkAcl,
  editNetworkAcl,
  randomNetworkAclName,
  renameNetworkAcl,
} from "./helpers/network-acls";

test("create a network acl", async ({ page }) => {
  const networkAcl = randomNetworkAclName();
  const newName = randomNetworkAclName();
  await createNetworkAcl(page, networkAcl);
  await editNetworkAcl(page, networkAcl);
  await renameNetworkAcl(page, networkAcl, newName);
  await deleteNetworkAcl(page, newName);
});
