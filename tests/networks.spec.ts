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

test("bridge network edit basic detail", async ({ page }) => {
  await editNetwork(page, network);
  await page.getByPlaceholder("Enter description").fill("A-new-description");
  await setOption(page, "IPv4 NAT", "false");
  await setOption(page, "IPv6 NAT", "false");

  await page
    .getByLabel("Network form navigation")
    .getByText("Bridge", { exact: true })
    .click();
  await activateOverride(page, "MTU");
  await page.getByLabel("MTU").fill("1300");
  await activateOverride(page, "Bridge driver");
  await page
    .getByRole("combobox", { name: "Bridge driver" })
    .selectOption("native");

  await page.getByText("DNS").click();
  await activateOverride(page, "DNS domain");
  await page.getByLabel("DNS domain").fill("abc");
  await activateOverride(page, "DNS mode");
  await page.getByRole("combobox", { name: "DNS mode" }).selectOption("none");
  await activateOverride(page, "DNS search");
  await page.getByLabel("DNS search").fill("abc");

  await page.getByText("IPv4").click();
  await activateOverride(page, "IPv4 DHCP expiry");
  await page.getByLabel("IPv4 DHCP expiry").fill("2h");

  await page.getByText("IPv6").click();
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
  await assertReadMode(page, "MTU", "1300");
  await assertReadMode(page, "Bridge driver", "native");

  await page.getByText("DNS", { exact: true }).click();
  await assertReadMode(page, "DNS domain", "abc");
  await assertReadMode(page, "DNS mode", "none");
  await assertReadMode(page, "DNS search", "abc");

  await page.getByText("IPv4", { exact: true }).click();
  await assertReadMode(page, "IPv4 DHCP expiry", "2h");

  await page.getByText("IPv6", { exact: true }).click();
  await assertReadMode(page, "IPv6 DHCP expiry", "3h");
  await assertReadMode(page, "IPv6 DHCP stateful", "true");
});

test("network forwards", async ({ page }) => {
  await createNetworkForward(page, network);
});

test("physical managed network create edit and delete", async ({ page }) => {
  const name = randomNetworkName();
  await createNetwork(page, name, "physical");
  await editNetwork(page, name);
  await page.getByText("DNS", { exact: true }).click();
  await activateOverride(page, "DNS nameservers");
  await page.getByLabel("DNS nameservers").fill("1.2.3.4");

  await page.getByText("IPv4", { exact: true }).click();
  await activateOverride(page, "IPv4 OVN ranges");
  await page.getByLabel("IPv4 OVN ranges").fill("1.2.3.4-1.2.3.5");
  await activateOverride(page, "IPv4 gateway");
  await page.getByLabel("IPv4 gateway").fill("1.2.3.4/1");
  await activateOverride(page, "IPv4 routes anycast");
  await page.getByLabel("IPv4 routes anycast").selectOption("true");

  await page.getByText("IPv6", { exact: true }).click();
  await activateOverride(page, "IPv6 OVN ranges");
  await page.getByLabel("IPv6 OVN ranges").fill("2600::1-2600::2");
  await activateOverride(page, "IPv6 gateway");
  await page.getByLabel("IPv6 gateway").fill("2600::/1");
  await activateOverride(page, "IPv6 routes anycast");
  await page.getByLabel("IPv6 routes anycast").selectOption("true");

  await page.getByText("OVN", { exact: true }).click();
  await activateOverride(page, "OVN ingress mode");
  await page.getByLabel("OVN ingress mode").selectOption("routed");

  await saveNetwork(page, name);

  await visitNetwork(page, name);
  await page.getByTestId("tab-link-Configuration").click();

  await page.getByText("DNS", { exact: true }).click();
  await assertReadMode(page, "DNS nameservers", "1.2.3.4");

  await page.getByText("IPv4", { exact: true }).click();
  await assertReadMode(page, "IPv4 OVN ranges", "1.2.3.4-1.2.3.5");
  await assertReadMode(page, "IPv4 gateway", "1.2.3.4/1");
  await assertReadMode(page, "IPv4 routes anycast", "true");

  await page.getByText("IPv6", { exact: true }).click();
  await assertReadMode(page, "IPv6 OVN ranges", "2600::1-2600::2");
  await assertReadMode(page, "IPv6 gateway", "2600::/1");
  await assertReadMode(page, "IPv6 routes anycast", "true");

  await page.getByText("OVN", { exact: true }).click();
  await assertReadMode(page, "OVN ingress mode", "routed");

  await deleteNetwork(page, name);
});
