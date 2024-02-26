import { test } from "./fixtures/lxd-test";
import {
  createNetwork,
  createNetworkForward,
  deleteNetwork,
  editNetwork,
  randomNetworkName,
  saveNetwork,
  visitNetwork,
} from "./helpers/network";
import {
  activateOverride,
  assertReadMode,
  setOption,
} from "./helpers/configuration";

let network = randomNetworkName();

test.beforeAll(async ({ browser, browserName }) => {
  // network names can only be 15 characters long
  network = `${browserName.substring(0, 2)}-${network}`;
  const page = await browser.newPage();
  await createNetwork(page, network);
  await page.close();
});

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage();
  await deleteNetwork(page, network);
  await page.close();
});

test("network edit basic details", async ({ page }) => {
  await editNetwork(page, network);
  await page.getByPlaceholder("Enter description").fill("A-new-description");
  await setOption(page, "IPv4 NAT", "false");
  await setOption(page, "IPv6 NAT", "false");

  await page
    .getByLabel("Network form navigation")
    .getByText("Bridge", { exact: true })
    .click();
  await activateOverride(page, "MTU Bridge MTU");
  await page.getByLabel("MTU").fill("1300");
  await activateOverride(page, "Bridge driver");
  await page
    .getByRole("combobox", { name: "Bridge driver" })
    .selectOption("native");

  await page.getByText("DNS").click();
  await activateOverride(page, "DNS domain Domain");
  await page.getByLabel("DNS domain").fill("abc");
  await activateOverride(page, "DNS mode");
  await page.getByRole("combobox", { name: "DNS mode" }).selectOption("none");
  await activateOverride(page, "DNS search");
  await page.getByLabel("DNS search").fill("abc");

  await page.getByText("IPv4").click();
  await activateOverride(page, "IPv4 DHCP true");
  await setOption(page, "IPv4 DHCP", "true");
  await activateOverride(page, "IPv4 DHCP expiry");
  await page.getByLabel("IPv4 DHCP expiry").fill("2h");

  await page.getByText("IPv6").click();
  await activateOverride(page, "IPv6 DHCP true");
  await setOption(page, "IPv6 DHCP", "true");
  await activateOverride(page, "IPv6 DHCP expiry");
  await page.getByLabel("IPv6 DHCP expiry").fill("3h");
  await activateOverride(page, "IPv6 DHCP stateful");
  await setOption(page, "IPv6 DHCP stateful", "true");

  await saveNetwork(page, network);

  await visitNetwork(page, network);
  await page.getByRole("cell", { name: "A-new-description" }).click();

  await page.getByTestId("tab-link-Configuration").click();
  await assertReadMode(page, "IPv4 NAT", "false");
  await assertReadMode(page, "IPv6 NAT", "false");

  await page
    .getByLabel("Network form navigation")
    .getByText("Bridge", { exact: true })
    .click();
  await assertReadMode(page, "MTU Bridge MTU", "1300");
  await assertReadMode(page, "Bridge driver", "native");

  await page.getByText("DNS", { exact: true }).click();
  await assertReadMode(page, "DNS domain Domain", "abc");
  await assertReadMode(page, "DNS mode", "none");
  await assertReadMode(page, "DNS search", "abc");

  await page.getByText("IPv4", { exact: true }).click();
  await assertReadMode(page, "IPv4 DHCP", "true");
  await assertReadMode(page, "IPv4 DHCP expiry", "2h");

  await page.getByText("IPv6", { exact: true }).click();
  await assertReadMode(page, "IPv6 DHCP true", "true");
  await assertReadMode(page, "IPv6 DHCP expiry", "3h");
  await assertReadMode(page, "IPv6 DHCP stateful", "true");
});

test("network forwards", async ({ page }) => {
  await createNetworkForward(page, network);
});
