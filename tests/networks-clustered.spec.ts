import { test, expect } from "./fixtures/lxd-test";
import { isServerClustered, skipIfNotSupported } from "./helpers/cluster";
import { gotoURL } from "./helpers/navigate";
import {
  createNetwork,
  createNetworkForward,
  deleteNetwork,
  getNetworkLink,
  randomNetworkName,
} from "./helpers/network";

let network = randomNetworkName();

test.describe("Network operations in a clustered environment with multiple nodes", () => {
  test.beforeAll(({ browserName }) => {
    // network names can only be 15 characters long
    network = `${browserName.substring(0, 2)}-${network}`;
  });

  test("create network forward", async ({ page, lxdVersion }) => {
    skipIfNotSupported(lxdVersion);
    //   skipIfNotClustered(testInfo.project.name);

    const serverClustered = await isServerClustered(page);
    await createNetwork(page, network);
    await createNetworkForward(page, network, serverClustered);
    await deleteNetwork(page, network);
  });

  test("create a physical network with different parents", async ({
    page,
    lxdVersion,
  }) => {
    skipIfNotSupported(lxdVersion);
    //   skipIfNotClustered(testInfo.project.name);

    await gotoURL(page, "/ui/");
    await page.getByRole("button", { name: "Networking" }).click();
    await page.getByRole("link", { name: "Networks", exact: true }).click();
    await page.getByRole("button", { name: "Create network" }).click();
    await page.getByRole("heading", { name: "Create a network" }).click();
    await page.getByLabel("Type").selectOption("physical");
    await page.getByLabel("Name", { exact: true }).click();
    await page.getByLabel("Name", { exact: true }).fill(network);
    await page.getByText("Same for all cluster members").click();
    await page.getByLabel("Parent").selectOption({ index: 2 });
    await page.getByRole("button", { name: "Create", exact: true }).click();
    const networkLink = await getNetworkLink(page, network);
    await expect(networkLink).toBeVisible();
    await deleteNetwork(page, network);
  });

  test("create a macvlan network with different parents", async ({
    page,
    lxdVersion,
  }) => {
    skipIfNotSupported(lxdVersion);
    //   skipIfNotClustered(testInfo.project.name);

    await gotoURL(page, "/ui/");
    await page.getByRole("button", { name: "Networking" }).click();
    await page.getByRole("link", { name: "Networks", exact: true }).click();
    await page.getByRole("button", { name: "Create network" }).click();
    await page.getByRole("heading", { name: "Create a network" }).click();
    await page.getByLabel("Type").selectOption("macvlan");
    await page.getByLabel("Name", { exact: true }).click();
    await page.getByLabel("Name", { exact: true }).fill(network);
    await page.getByText("Same for all cluster members").click();
    await page.getByLabel("Parent").selectOption({ index: 2 });
    await page.getByRole("button", { name: "Create", exact: true }).click();
    const networkLink = await getNetworkLink(page, network);
    await expect(networkLink).toBeVisible();
    await deleteNetwork(page, network);
  });
});
