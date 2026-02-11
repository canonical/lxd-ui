import type { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { activateAllTableOverrides } from "./configuration";
import { gotoURL } from "./navigate";
import { expect } from "../fixtures/lxd-test";
import { isServerClustered } from "./cluster";
import { execSync } from "child_process";

export const randomNetworkName = (): string => {
  return `test-${randomNameSuffix()}`;
};

export const ensureOvnNorthboundConnection = () => {
  try {
    execSync(
      'sudo -E lxc config set network.ovn.northbound_connection "ssl:127.0.0.1:6641"',
    );
  } catch (error) {
    console.log("Failed to set OVN northbound connection:", error);
  }
};

export const createNetwork = async (
  page: Page,
  network: string,
  type = "bridge",
  options: {
    hasMemberSpecificParents?: boolean;
    networkACL?: string;
    uplink?: string;
  } = {},
) => {
  const { hasMemberSpecificParents, networkACL, uplink } = options;
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Networking" }).click();
  await page.getByRole("link", { name: "Networks", exact: true }).click();
  await page.getByRole("button", { name: "Create network" }).click();
  await page.getByRole("heading", { name: "Create a network" }).click();
  await page.getByRole("button", { name: "Type" }).click();
  await page.getByLabel("submenu").getByText(type).first().click();
  await page.getByLabel("Name", { exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill(network);

  if (["physical", "sr-iov", "macvlan"].includes(type)) {
    if (hasMemberSpecificParents) {
      await page.getByText("Same for all cluster members").click();
    }
    await page.getByLabel("Parent").selectOption({ index: 1 });
  }
  if (type === "ovn") {
    if (uplink) {
      await page.getByLabel("Uplink").selectOption(uplink);
    } else {
      await page.getByLabel("Uplink").selectOption({ index: 1 });
    }
  }
  if (networkACL) {
    await page.getByLabel("Select ACLs").click();
    await page.locator("label").filter({ hasText: networkACL }).click();
  }
  await submitCreateNetwork(page, network);
};

export const deleteNetwork = async (page: Page, network: string) => {
  await visitNetwork(page, network);

  const deleteButton = page.getByRole("button", { name: "Delete network" });

  // Check if the delete button is enabled
  const isEnabled = await deleteButton.isEnabled();
  if (!isEnabled) {
    console.log(
      `Network ${network} cannot be deleted - it is currently in use`,
    );
    return;
  }

  await deleteButton.click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForTimeout(2500);
  const networkLink = await getNetworkLink(page, network);
  await expect(networkLink).not.toBeVisible();
};

export const visitNetwork = async (page: Page, network: string) => {
  await gotoURL(page, "/ui/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Networking" }).click();
  await page.getByRole("link", { name: "Networks", exact: true }).click();
  await page.getByRole("link", { name: network }).first().click();
  await page.getByTestId("tab-link-Configuration").click();
};

export const prepareNetworkTabEdit = async (
  page: Page,
  networkName: string,
) => {
  await visitNetwork(page, networkName);
  await activateAllTableOverrides(page);
};

export const visitNetworkConfiguration = async (page: Page, tab: string) => {
  await page
    .getByLabel("Network form navigation")
    .getByText(tab, { exact: true })
    .click();
  await activateAllTableOverrides(page);
};

export const createNetworkForward = async (page: Page, network: string) => {
  const serverClustered = await isServerClustered(page);
  await visitNetwork(page, network);
  await page.getByText("/24").getByRole("button").click();

  const networkSubnet = await page.inputValue("input#ipv4_address");

  const listenAddress = networkSubnet.replace("1/24", "1");
  const targetAddress = networkSubnet.replace("1/24", "3");

  await page.getByRole("link", { name: "Forwards" }).click();
  await page.getByRole("button", { name: "Create forward" }).click();
  await page.getByLabel("Listen address").fill(listenAddress);

  let portInput = page.getByLabel("0 listen port");
  let addressInput = page.getByLabel("0 target address");
  await page.getByRole("button", { name: "Add port" }).click();
  await portInput.click();
  await portInput.fill("80");
  await addressInput.click();
  await addressInput.fill(targetAddress);
  await page.getByRole("button", { name: "Add port" }).click();
  portInput = page.getByLabel("1 listen port");
  addressInput = page.getByLabel("1 target address");
  await portInput.click();
  await portInput.fill("23,443-455");
  await addressInput.click();
  await addressInput.fill(targetAddress);

  if (serverClustered) {
    await page.getByLabel("Location").selectOption({ index: 1 });
  }

  await page.getByRole("button", { name: "Create" }).click();
  await page
    .getByText(`Network forward with listen address ${listenAddress} created.`)
    .click();
  await expect(page.getByText(`:80 → ${targetAddress}:80 (tcp)`)).toBeVisible();
  await expect(
    page.getByText(`:23,443-455 → ${targetAddress}:23,443-455 (tcp)`),
  ).toBeVisible();

  await page.getByRole("link", { name: "Edit network forward" }).click();
  await expect(page.getByText("Edit a network forward")).toBeVisible();
  await expect(page.getByText("Same as listen port if empty")).toBeVisible(); // ensure the forward ports are loaded before continuing
  await page.getByLabel("Description").fill("My forward description");
  await page.getByRole("button", { name: "Update" }).click();

  await page.getByText(`Network forward ${listenAddress} updated.`).click();
  await expect(page.getByText("My forward description")).toBeVisible();

  await page.getByRole("link", { name: "Leases" }).click();
  await expect(page.getByText(`${network}.gw`).first()).toBeVisible();

  await page.getByRole("link", { name: "IPAM", exact: true }).click();
  await expect(page.getByText("network-forward").first()).toBeVisible();

  await visitNetwork(page, network);
  await page.getByRole("link", { name: "Forwards" }).click();
  await page.getByRole("button", { name: "Delete network forward" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(
    page.getByText(
      `Network forward with listen address ${listenAddress} deleted.`,
    ),
  ).toBeVisible();
};

export const getNetworkLink = async (page: Page, network: string) => {
  // network actions may result in ERR_NETWORK_CHANGED, we should wait for network to settle before checking visibility
  await page.waitForLoadState("networkidle");
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Networking" }).click();
  await page.getByTitle("Networks (default)").click();
  const networkLink = page.getByRole("link", { name: network, exact: true });
  return networkLink;
};

export const submitCreateNetwork = async (page: Page, network: string) => {
  await page.waitForTimeout(750);
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForTimeout(5000);
  const networkLink = await getNetworkLink(page, network);
  await expect(networkLink).toBeVisible();
};

export const createNetworkLocalPeering = async (
  page: Page,
  localPeeringName: string,
  network: string,
  targetNetwork: string,
  toggleMutualPeering?: boolean,
) => {
  await visitNetwork(page, network);
  await page.getByRole("link", { name: "Local peerings" }).click();
  await page.getByRole("button", { name: "Create local peering" }).click();
  await page.getByRole("textbox", { name: "* Name" }).fill(localPeeringName);
  await page.getByRole("button", { name: "* Target network" }).click();
  await page
    .getByRole("option", { name: `${targetNetwork} ovn -`, exact: true })
    .click();

  const mutualPeeringCheckbox = page.getByLabel("Create mutual peering");
  if (toggleMutualPeering) {
    await mutualPeeringCheckbox.check();
  } else {
    const isChecked = await mutualPeeringCheckbox.isChecked();
    if (isChecked) {
      await page.getByText("Create mutual peering").click();
    }
  }

  await page
    .getByLabel("Side panel")
    .getByRole("button", { name: "Create local peering" })
    .click();
  await expect(
    page.getByText(`Local peering ${localPeeringName} created`),
  ).toBeVisible();
};

export const deleteLocalPeerings = async (
  page: Page,
  network: string,
  localPeeringName: string,
) => {
  await visitNetwork(page, network);
  await page.getByRole("link", { name: "Local peerings" }).click();
  await page.getByRole("button", { name: "Delete local peering" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();

  await expect(
    page.getByRole("row").filter({ hasText: localPeeringName }),
  ).not.toBeVisible();
  await expect(
    page.getByText(
      `Local peering ${localPeeringName} deleted for network ${network}`,
    ),
  ).toBeVisible();
};

export const createOvnUplink = async (page: Page, network: string) => {
  ensureOvnNorthboundConnection();

  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Networking" }).click();
  await page.getByRole("link", { name: "Networks", exact: true }).click();
  const createNetworkBtn = page.getByRole("button", { name: "Create network" });
  await expect(createNetworkBtn).toBeVisible();

  const existingNetwork = page.getByRole("link", {
    name: network,
    exact: true,
  });
  if (await existingNetwork.isVisible()) {
    return;
  }

  await createNetworkBtn.click();

  await page.getByRole("button", { name: "Type" }).click();
  await page.getByLabel("submenu").getByText("bridge").first().click();
  await page.getByLabel("Name", { exact: true }).fill(network);

  await page.waitForTimeout(1000);

  const customRadio = page.getByRole("radio", { name: "Custom" }).first();
  await customRadio.check({ force: true });
  await expect(customRadio).toBeChecked();

  await expect(page.getByLabel("IPv4 address")).toBeEnabled();
  await page.getByLabel("IPv4 address").fill("10.42.42.1/24");

  const ovnRangesRow = page.locator('tr[name*="ipv4_ovn_ranges"]');
  const ovnRangesOverrideBtn = ovnRangesRow.getByRole("button", {
    name: "Create override",
  });
  await expect(ovnRangesOverrideBtn).toBeVisible();
  await ovnRangesOverrideBtn.click();
  await page.getByLabel("IPv4 OVN ranges").fill("10.42.42.100-10.42.42.150");

  const dhcpRangesRow = page.locator('tr[name*="ipv4_dhcp_ranges"]');
  const dhcpRangesOverrideBtn = dhcpRangesRow.getByRole("button", {
    name: "Create override",
  });
  await expect(dhcpRangesOverrideBtn).toBeVisible();
  await dhcpRangesOverrideBtn.click();
  await page.getByLabel("IPv4 DHCP ranges").fill("10.42.42.50-10.42.42.99");

  await submitCreateNetwork(page, network);
};
