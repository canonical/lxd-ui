import { expect, test } from "./fixtures/lxd-test";
import { skipIfNotClustered, skipIfNotSupported } from "./helpers/cluster";
import {
  createNetwork,
  createNetworkLocalPeering,
  createOvnUplink,
  deleteLocalPeerings,
  deleteNetwork,
  randomNetworkName,
  visitNetwork,
} from "./helpers/network";

test.describe("Network Local Peering", () => {
  const UPLINK_NAME = "ovn-uplink";

  test.beforeAll(async ({ browser, lxdVersion }, testInfo) => {
    if (
      lxdVersion === "5.0-edge" ||
      !testInfo.project.name.includes(":clustered")
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
      lxdVersion === "5.0-edge" ||
      !testInfo.project.name.includes(":clustered")
    ) {
      console.log("Skipping uplink deletion");
      return;
    }
    const page = await browser.newPage();
    await deleteNetwork(page, UPLINK_NAME);
    await page.close();
  });

  test("Create mutual peering between two OVN networks", async ({
    page,
    lxdVersion,
  }, testInfo) => {
    skipIfNotSupported(lxdVersion);
    skipIfNotClustered(testInfo.project.name);

    const networkA = randomNetworkName();
    const networkB = randomNetworkName();
    const peering = "peer-mutual";

    await createNetwork(page, networkA, "ovn", {
      uplink: UPLINK_NAME,
    });
    await createNetwork(page, networkB, "ovn", {
      uplink: UPLINK_NAME,
    });

    await createNetworkLocalPeering(page, peering, networkA, networkB, true);

    await expect(
      page.getByRole("row").filter({ hasText: peering }).getByText("Created"),
    ).toBeVisible();

    await visitNetwork(page, networkB);
    await page.getByRole("link", { name: "Local peerings" }).click();
    await expect(
      page.getByRole("row").filter({ hasText: peering }).getByText("Created"),
    ).toBeVisible();

    await deleteLocalPeerings(page, networkA, peering);
    await deleteLocalPeerings(page, networkB, peering);

    await deleteNetwork(page, networkA);
    await deleteNetwork(page, networkB);
  });

  test("Create non-mutual peering between two OVN networks", async ({
    page,
    lxdVersion,
  }, testInfo) => {
    skipIfNotSupported(lxdVersion);
    skipIfNotClustered(testInfo.project.name);

    const networkA = randomNetworkName();
    const networkB = randomNetworkName();
    const peering = "peer-one-way";

    await createNetwork(page, networkA, "ovn", {
      uplink: UPLINK_NAME,
    });
    await createNetwork(page, networkB, "ovn", {
      uplink: UPLINK_NAME,
    });

    await createNetworkLocalPeering(page, peering, networkA, networkB, false);

    await expect(
      page.getByRole("row").filter({ hasText: peering }).getByText("Pending"),
    ).toBeVisible();

    await visitNetwork(page, networkB);
    await page.getByRole("link", { name: "Local peerings" }).click();
    await expect(
      page.getByRole("row").filter({ hasText: peering }),
    ).not.toBeVisible();

    await createNetworkLocalPeering(page, peering, networkB, networkA, false);
    await expect(
      page.getByRole("row").filter({ hasText: peering }).getByText("Created"),
    ).toBeVisible();

    await visitNetwork(page, networkA);
    await page.getByRole("link", { name: "Local peerings" }).click();
    await expect(
      page.getByRole("row").filter({ hasText: peering }).getByText("Created"),
    ).toBeVisible();

    await deleteLocalPeerings(page, networkA, peering);
    await deleteLocalPeerings(page, networkB, peering);

    await deleteNetwork(page, networkA);
    await deleteNetwork(page, networkB);
  });

  test("Manual entry should disable mutual peering checkbox", async ({
    page,
    lxdVersion,
  }, testInfo) => {
    skipIfNotSupported(lxdVersion);
    skipIfNotClustered(testInfo.project.name);

    const networkA = randomNetworkName();
    const peering = "peer-manual-test";
    const randomProject = `project-${Math.random().toString(36).substring(7)}`;
    const randomTargetNetwork = randomNetworkName();

    await createNetwork(page, networkA, "ovn", {
      uplink: UPLINK_NAME,
    });
    await visitNetwork(page, networkA);
    await page.getByRole("link", { name: "Local peerings" }).click();
    await page.getByRole("button", { name: "Create local peering" }).click();
    await page.getByRole("textbox", { name: "* Name" }).fill(peering);

    await page.getByRole("button", { name: "* Target project" }).click();
    await page.getByRole("option", { name: "Manually enter project" }).click();
    await page
      .getByPlaceholder("Enter target project name")
      .fill(randomProject);

    await page
      .getByPlaceholder("Enter target network name")
      .fill(randomTargetNetwork);

    const mutualCheckbox = page.getByLabel("Create mutual peering");
    await expect(mutualCheckbox).toBeDisabled();

    await page
      .getByLabel("Side panel")
      .getByRole("button", { name: "Create local peering" })
      .click();

    await expect(
      page.getByText(`Local peering ${peering} created`),
    ).toBeVisible();

    await expect(
      page.getByRole("row").filter({ hasText: peering }).getByText("Pending"),
    ).toBeVisible();

    await deleteLocalPeerings(page, networkA, peering);
    await deleteNetwork(page, networkA);
  });
});
