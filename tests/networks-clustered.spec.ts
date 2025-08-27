import { test } from "./fixtures/lxd-test";
import { skipIfNotClustered, skipIfNotSupported } from "./helpers/cluster";
import {
  createNetwork,
  createNetworkForward,
  deleteNetwork,
  randomNetworkName,
} from "./helpers/network";

let network = randomNetworkName();

test.describe("Network operations in a clustered environment with a single node", () => {
  test("create network forward", async ({
    page,
    lxdVersion,
    browserName,
  }, testInfo) => {
    network = `${browserName.substring(0, 2)}-${network}`;
    skipIfNotSupported(lxdVersion);
    skipIfNotClustered(testInfo.project.name);

    await createNetwork(page, network);
    await createNetworkForward(page, network);
    await deleteNetwork(page, network);
  });

  test("create a physical network with different parents", async ({
    page,
    lxdVersion,
    browserName,
  }, testInfo) => {
    network = `${browserName.substring(0, 2)}-${network}`;
    skipIfNotSupported(lxdVersion);
    skipIfNotClustered(testInfo.project.name);

    await createNetwork(page, network, "physical", true);
    await deleteNetwork(page, network);
  });

  test("create a macvlan network with different parents", async ({
    page,
    lxdVersion,
    browserName,
  }, testInfo) => {
    network = `${browserName.substring(0, 2)}-${network}`;
    skipIfNotSupported(lxdVersion);
    skipIfNotClustered(testInfo.project.name);

    await createNetwork(page, network, "macvlan", true);
    await deleteNetwork(page, network);
  });
});
