import { test } from "./fixtures/lxd-test";
import {
  createClusterLink,
  deleteClusterLink,
  editClusterLink,
  randomLinkName,
  skipIfNotSupported,
} from "./helpers/cluster-links";
import { skipIfNotClustered } from "./helpers/cluster";

test("cluster link create edit delete", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const link = randomLinkName();
  await createClusterLink(page, link);
  await editClusterLink(page, link);
  await deleteClusterLink(page, link);
});
