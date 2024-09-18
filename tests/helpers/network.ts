import { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { LxdNetworkType } from "types/network";
import { activateAllTableOverrides } from "./configuration";

export const randomNetworkName = (): string => {
  return `test-${randomNameSuffix()}`;
};

export const createNetwork = async (
  page: Page,
  network: string,
  type: LxdNetworkType = "bridge",
) => {
  await page.goto("/ui/");
  await page.getByRole("link", { name: "Networks", exact: true }).click();
  await page.getByRole("button", { name: "Create network" }).click();
  await page.getByRole("heading", { name: "Create a network" }).click();
  await page.getByLabel("Type").selectOption(type);
  await page.getByLabel("Name", { exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill(network);
  if (type === "physical") {
    await page.getByLabel("Parent").selectOption({ index: 1 });
  }
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForSelector(`text=Network ${network} created.`);
  await page.getByRole("button", { name: "Close notification" }).click();
};

export const deleteNetwork = async (page: Page, network: string) => {
  await visitNetwork(page, network);
  await page.getByRole("button", { name: "Delete network" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForSelector(`text=Network ${network} deleted.`);
};

export const visitNetwork = async (page: Page, network: string) => {
  await page.goto("/ui/");
  await page.getByTitle("Networks (default)").click();
  await page.getByRole("link", { name: network }).first().click();
  await page.getByTestId("tab-link-Configuration").click();
};

export const prepareNetworkTabEdit = async (
  page: Page,
  tabLocation: string,
  networkName: string,
) => {
  await visitNetwork(page, networkName);
  await page
    .getByLabel("Network form navigation")
    .getByText(tabLocation)
    .click();
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
  await createNetwork(page, network);
  await visitNetwork(page, network);
  await page.getByRole("gridcell", { name: "/24" }).getByRole("button").click();

  const networkSubnet = await page.inputValue("input#ipv4_address");

  const listenAddress = networkSubnet.replace("1/24", "1");
  const targetAddress = networkSubnet.replace("1/24", "3");

  await page.getByTestId("tab-link-Forwards").click();
  await page.getByRole("link", { name: "Create forward" }).click();
  await page.getByLabel("Listen address").fill(listenAddress);

  await page.getByRole("button", { name: "Add port" }).click();
  await page.getByLabel("0 listen port").click();
  await page.keyboard.type("80");
  await page.getByLabel("0 target address").click();
  await page.keyboard.type(targetAddress);
  await page.getByRole("button", { name: "Add port" }).click();
  await page.getByLabel("1 listen port").click();
  await page.keyboard.type("23,443-455");
  await page.getByLabel("1 target address").click();
  await page.keyboard.type(targetAddress);
  await page.getByRole("button", { name: "Create" }).click();

  await page.getByText(`Network forward ${listenAddress} created.`).click();
  await page.getByText(`:80 → ${targetAddress}:80 (tcp)`).click();
  await page
    .getByText(`:23,443-455 → ${targetAddress}:23,443-455 (tcp)`)
    .click();

  await deleteNetwork(page, network);
};
