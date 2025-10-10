import type { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import type { LxdNetworkType } from "types/network";
import { activateAllTableOverrides } from "./configuration";
import { gotoURL } from "./navigate";
import { expect } from "../fixtures/lxd-test";
import { isServerClustered } from "./cluster";

export const randomNetworkName = (): string => {
  return `test-${randomNameSuffix()}`;
};

export const createNetwork = async (
  page: Page,
  network: string,
  type: LxdNetworkType = "bridge",
  hasMemberSpecificParents?: boolean,
) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Networking" }).click();
  await page.getByRole("link", { name: "Networks", exact: true }).click();
  await page.getByRole("button", { name: "Create network" }).click();
  await page.getByRole("heading", { name: "Create a network" }).click();
  await page.getByLabel("Type").selectOption(type);
  await page.getByLabel("Name", { exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill(network);

  if (["physical", "sriov", "macvlan"].includes(type)) {
    if (hasMemberSpecificParents) {
      await page.getByText("Same for all cluster members").click();
    }
    await page.getByLabel("Parent").selectOption({ index: 1 });
  }
  if (type === "ovn") {
    await page.getByLabel("Uplink").selectOption({ index: 1 });
  }
  await page.waitForTimeout(750);
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForTimeout(2500);
  const networkLink = await getNetworkLink(page, network);
  await expect(networkLink).toBeVisible();
};

export const deleteNetwork = async (page: Page, network: string) => {
  await visitNetwork(page, network);
  await page.getByRole("button", { name: "Delete network" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  const networkLink = await getNetworkLink(page, network);
  await expect(networkLink).not.toBeVisible();
};

export const visitNetwork = async (page: Page, network: string) => {
  await gotoURL(page, "/ui/");
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

  await page.getByTestId("tab-link-Forwards").click();
  await page.getByRole("link", { name: "Create forward" }).click();
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
  await page.getByText(`:80 → ${targetAddress}:80 (tcp)`).click();
  await page
    .getByText(`:23,443-455 → ${targetAddress}:23,443-455 (tcp)`)
    .click();

  await page.getByRole("link", { name: "Edit network forward" }).click();
  await expect(page.getByText("Edit a network forward")).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Description").fill("My forward description");
  await page.getByRole("button", { name: "Update" }).click();

  await page.getByText(`Network forward ${listenAddress} updated.`).click();
  await expect(page.getByText(`My forward description`)).toBeVisible();

  await page.getByTestId("tab-link-Leases").click();
  await expect(page.getByText(`${network}.gw`).first()).toBeVisible();

  await page.getByRole("link", { name: "IPAM", exact: true }).click();
  await expect(page.getByText(`network-forward`).first()).toBeVisible();

  await visitNetwork(page, network);
  await page.getByTestId("tab-link-Forwards").click();
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
  await page.getByRole("link", { name: "Networks", exact: true }).click();
  const networkLink = page.getByRole("link", { name: network, exact: true });
  return networkLink;
};
