import { test } from "./fixtures/lxd-test";
import { skipIfNotClustered, skipIfNotSupported } from "./helpers/cluster";
import {
  createNetwork,
  createNetworkForward,
  deleteNetwork,
  randomNetworkName,
} from "./helpers/network";

test.describe("Network operations in a clustered environment with a single node", () => {
  test("create network forward", async ({
    page,
    lxdVersion,
    browserName,
  }, testInfo) => {
    const network = `${browserName.substring(0, 2)}-${randomNetworkName()}`;
    skipIfNotSupported(lxdVersion);
    skipIfNotClustered(testInfo.project.name);

    await createNetwork(page, network);
    await createNetworkForward(page, network);
    await deleteNetwork(page, network);
  });

  test("create a member-specific physical network ", async ({
    page,
    lxdVersion,
    browserName,
  }, testInfo) => {
    const network = `${browserName.substring(0, 2)}-${randomNetworkName()}`;
    skipIfNotSupported(lxdVersion);
    skipIfNotClustered(testInfo.project.name);

    await createNetwork(page, network, "physical", {
      hasMemberSpecificParents: true,
    });
    await deleteNetwork(page, network);
  });

  test("create a member-specific macvlan network", async ({
    page,
    lxdVersion,
    browserName,
  }, testInfo) => {
    const network = `${browserName.substring(0, 2)}-${randomNetworkName()}`;
    skipIfNotSupported(lxdVersion);
    skipIfNotClustered(testInfo.project.name);

    await createNetwork(page, network, "macvlan", {
      hasMemberSpecificParents: true,
    });
    await deleteNetwork(page, network);
  });
});
