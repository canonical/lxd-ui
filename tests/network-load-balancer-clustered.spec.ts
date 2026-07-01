import { test } from "./fixtures/lxd-test";
import {
  createNetwork,
  createOvnUplink,
  deleteNetwork,
  randomLoadBalancerPoolName,
  randomNetworkName,
  skipIfLoadBalancersNotSupported,
  supportsLoadBalancers,
  visitNetwork,
} from "./helpers/network";
import { isClusteredTestProject, skipIfNotClustered } from "./helpers/cluster";
import { dismissNotification } from "./helpers/notification";

test.describe("Network Load Balancer", () => {
  const UPLINK_NAME = randomNetworkName();

  test.beforeAll(async ({ browser, lxdVersion }, testInfo) => {
    if (
      !supportsLoadBalancers(lxdVersion) ||
      !isClusteredTestProject(testInfo.project.name)
    ) {
      console.log("Skipping uplink creation");
      return;
    }
    const page = await browser.newPage();
    await createOvnUplink(page, UPLINK_NAME);
    await page.close();
  });

  test.afterAll(async ({ browser, lxdVersion }, testInfo) => {
    if (
      !supportsLoadBalancers(lxdVersion) ||
      !isClusteredTestProject(testInfo.project.name)
    ) {
      console.log("Skipping uplink deletion");
      return;
    }
    const page = await browser.newPage();
    await deleteNetwork(page, UPLINK_NAME);
    await page.close();
  });

  test("Create, update, delete load balancer", async ({
    page,
    lxdVersion,
  }, testInfo) => {
    skipIfLoadBalancersNotSupported(lxdVersion);
    skipIfNotClustered(testInfo.project.name);

    const network = randomNetworkName();

    await createNetwork(page, network, "ovn", {
      uplink: UPLINK_NAME,
    });

    await visitNetwork(page, network);

    await page.getByText("/24").getByRole("button").click();
    const networkSubnet = await page.inputValue("input#ipv4_address");
    const balancerListenAddress = networkSubnet.replace("1/24", "3");

    await page.getByRole("link", { name: "Load balancers" }).click();
    await page
      .getByRole("button", { name: "Create load balancer pool" })
      .click();

    const loadBalancerPool = randomLoadBalancerPoolName();

    const sidePanel = page.getByLabel("Side panel");
    await sidePanel.getByLabel("Name").fill(loadBalancerPool);
    await sidePanel.getByLabel("Target port").fill("23");
    await sidePanel.getByLabel("Health check").selectOption("Default");

    await sidePanel
      .getByRole("button", { name: "Create load balancer pool" })
      .click();

    await dismissNotification(
      page,
      `Load balancer pool ${loadBalancerPool} created.`,
    );

    await page
      .getByRole("button", { name: "Create load balancer", exact: true })
      .click();

    await page.getByText("Manually enter address").click();
    await page.getByPlaceholder("Enter IP address").fill(balancerListenAddress);
    await page.getByPlaceholder("Port number").fill("23");

    await page.getByRole("button", { name: "Create" }).click();

    await dismissNotification(
      page,
      `Load balancer ${balancerListenAddress} created.`,
    );

    await page
      .getByRole("row")
      .filter({ hasText: balancerListenAddress })
      .getByRole("link", { name: "Edit load balancer" })
      .click();
    await page.getByLabel("Description").fill("Updated description");
    await page.getByRole("button", { name: "Update" }).click();
    await dismissNotification(
      page,
      `Load balancer ${balancerListenAddress} updated.`,
    );

    await page
      .getByRole("row")
      .filter({ hasText: balancerListenAddress })
      .getByRole("button", { name: "Delete load balancer" })
      .click();
    await page
      .getByRole("dialog", { name: "Confirm delete" })
      .getByRole("button", { name: "Delete" })
      .click();
    await dismissNotification(
      page,
      `Load balancer with listen address ${balancerListenAddress} deleted.`,
    );

    await page.getByLabel("Load balancers").getByText("Pools").click();

    await page
      .getByRole("row")
      .filter({ hasText: loadBalancerPool })
      .getByRole("button", { name: "Delete load balancer pool" })
      .click();
    await page
      .getByRole("dialog", { name: "Confirm delete" })
      .getByRole("button", { name: "Delete" })
      .click();
    await dismissNotification(
      page,
      `Load balancer pool ${loadBalancerPool} deleted.`,
    );

    await deleteNetwork(page, network);
  });
});
