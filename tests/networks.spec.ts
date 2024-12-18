import { test } from "./fixtures/lxd-test";
import {
  activateAllTableOverrides,
  checkAllOptions,
  setTextarea,
} from "./helpers/configuration";
import { gotoURL } from "./helpers/navigate";
import {
  createNetwork,
  createNetworkForward,
  deleteNetwork,
  prepareNetworkTabEdit,
  randomNetworkName,
  visitNetwork,
  visitNetworkConfiguration,
} from "./helpers/network";
import {
  getServerSettingValue,
  updateSetting,
  visitServerSettings,
} from "./helpers/server";

let network = randomNetworkName();
let initialNorthboundNetworkValue: string = "";

test.describe("bridge type", () => {
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

  test("configure main bridge network settings", async ({ page }) => {
    await visitNetwork(page, network);

    await page.getByRole("button", { name: "Edit" }).first().click();
    const DESCRIPTION = "A-new-description";
    await page.getByPlaceholder("Enter description").fill(DESCRIPTION);

    const radioButtons = await page.$$("input[type=radio]");
    for (const button of radioButtons) {
      await button.click({ force: true });
    }

    const IPV4_ADDRESS = "10.141.1.1/24";
    await page.getByLabel("IPv4 address").fill(IPV4_ADDRESS);

    const IPV6_ADDRESS = "2001:db8::1/64";
    await page.getByLabel("IPv6 address").fill(IPV6_ADDRESS);

    const options = ["false", "true"];
    await checkAllOptions(page, "IPv4 NAT", options);
    await checkAllOptions(page, "IPv6 NAT", options);
  });

  test("set bridge network driver and hardware details", async ({ page }) => {
    await prepareNetworkTabEdit(page, "Bridge", network);

    const MTU = "1300";
    await setTextarea(page, "MTU", MTU);

    const HARDWARE_ADDRESS = "00:11:22:33:44:55";
    await setTextarea(page, "Hardware address", HARDWARE_ADDRESS);

    const options = ["openvswitch", "native"];
    await checkAllOptions(page, "Bridge driver", options);
  });

  test("configure bridge DNS settings", async ({ page }) => {
    await prepareNetworkTabEdit(page, "DNS", network);

    const DNS_DOMAIN = "example.com";
    await setTextarea(page, "DNS domain", DNS_DOMAIN);

    const DNS_SEARCH = "search.example.com";
    await setTextarea(page, "DNS search", DNS_SEARCH);

    const options = ["none", "managed", "dynamic"];
    await checkAllOptions(page, "DNS mode", options);
  });

  test("set bridge IPv4 DHCP and range configuration", async ({ page }) => {
    await prepareNetworkTabEdit(page, "IPv4", network);

    const options = ["false", "true"];
    for (const option of options) {
      await page
        .getByRole("combobox", { name: "IPv4 DHCP", exact: true })
        .selectOption(option);
    }

    const DHCP_EXPIRY = "2h";
    await setTextarea(page, "IPv4 DHCP expiry", DHCP_EXPIRY);

    const OVN_RANGES = "10.141.1.50-10.141.1.99";
    await setTextarea(page, "IPv4 OVN ranges", OVN_RANGES);

    const DHCP_RANGES = "192.168.1.100-192.168.1.150";
    await setTextarea(page, "IPv4 DHCP ranges", DHCP_RANGES);
  });

  test("configure bridge IPv6 DHCP and range settings", async ({ page }) => {
    await prepareNetworkTabEdit(page, "IPv6", network);

    const options = ["false", "true"];
    for (const option of options) {
      await page
        .getByRole("combobox", { name: "IPv6 DHCP", exact: true })
        .selectOption(option);
    }
    await checkAllOptions(page, "IPv6 DHCP stateful", options);

    const DHCP_EXPIRY = "2h";
    await setTextarea(page, "IPv6 DHCP expiry", DHCP_EXPIRY);

    const DHCP_RANGES = "2001:db8::100-2001:db8::150";
    await setTextarea(page, "IPv6 DHCP ranges", DHCP_RANGES);

    const OVN_RANGES = "2001:db8::100-2001:db8::150";
    await setTextarea(page, "IPv6 OVN ranges", OVN_RANGES);
  });
});

test.describe("physical type", () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await createNetwork(page, network, "physical");
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await deleteNetwork(page, network);
    await page.close();
  });

  test("configure physical network DNS nameservers", async ({ page }) => {
    await prepareNetworkTabEdit(page, "DNS", network);

    const DNS_NAMESERVERS = "32.152.61.210";
    await setTextarea(page, "DNS nameservers", DNS_NAMESERVERS);
  });

  test("set physical network IPv4 routes and gateway", async ({ page }) => {
    await prepareNetworkTabEdit(page, "IPv4", network);

    const IPV4_ADDRESS = "10.141.1.1/24";
    await setTextarea(page, "IPv4 gateway", IPV4_ADDRESS);

    const OVN_RANGES = "10.141.1.100-10.141.1.110";
    await setTextarea(page, "IPv4 OVN ranges", OVN_RANGES);

    const IPV4_ROUTES = "10.141.1.1";
    await page.getByLabel("IPv4 routes", { exact: true }).fill(IPV4_ROUTES);

    const options = ["true", "false"];
    await checkAllOptions(page, "IPv4 routes anycast", options);
  });

  test("configure physical network IPv6 routes and gateway", async ({
    page,
  }) => {
    await prepareNetworkTabEdit(page, "IPv6", network);

    const OVN_RANGES = "2001:db8::100-2001:db8::150";
    await setTextarea(page, "IPv6 OVN ranges", OVN_RANGES);

    const IPV6_GATEWAY = "2001:db8::100";
    await setTextarea(page, "IPv6 gateway", IPV6_GATEWAY);
    await page.getByLabel("IPv6 routes", { exact: true }).fill(IPV6_GATEWAY);

    const options = ["true", "false"];
    await checkAllOptions(page, "IPv6 routes anycast", options);
  });

  test("set physical network OVN ingress mode", async ({ page }) => {
    await prepareNetworkTabEdit(page, "OVN", network);

    const options = ["l2proxy", "routed"];
    await checkAllOptions(page, "OVN ingress mode", options);
  });
});

test.describe("OVN type", () => {
  test.beforeAll(async ({ browser, lxdVersion }) => {
    if (lxdVersion === "5.0-edge") {
      return;
    }

    const page = await browser.newPage();

    await visitServerSettings(page);
    initialNorthboundNetworkValue =
      (await getServerSettingValue(
        page,
        "network.ovn.northbound_connection",
      )) ?? "";
    await updateSetting(
      page,
      "network.ovn.northbound_connection",
      "text",
      "foo",
    );

    await page.close();
  });

  test.afterAll(async ({ browser, lxdVersion }) => {
    if (lxdVersion === "5.0-edge") {
      return;
    }

    const page = await browser.newPage();

    await visitServerSettings(page);
    await updateSetting(
      page,
      "network.ovn.northbound_connection",
      "text",
      initialNorthboundNetworkValue,
    );

    await page.close();
  });

  test.beforeEach(async ({ page, lxdVersion }) => {
    test.skip(
      lxdVersion === "5.0-edge",
      "OVN can not be configured in lxd v5.0/edge",
    );

    await gotoURL(page, "/ui/");
    await page.getByRole("link", { name: "Networks", exact: true }).click();
    await page.getByRole("button", { name: "Create network" }).click();
    await page.getByRole("heading", { name: "Create a network" }).click();
    await page.getByLabel("Type").selectOption("OVN");
    await page.getByLabel("Name").click();
    await page.getByLabel("Name").fill(network);
    await page.getByLabel("Uplink").selectOption({ index: 1 });
  });

  test("configure main OVN network settings", async ({ page }) => {
    await activateAllTableOverrides(page);

    const DESCRIPTION = "A-new-description";
    await page.getByPlaceholder("Enter description").fill(DESCRIPTION);

    const radioButtons = await page.$$("input[type=radio]");
    for (const button of radioButtons) {
      await button.click({ force: true });
    }

    await page.getByRole("button", { name: "Create override" }).first().click();
    await page.getByLabel("Custom").first().check({ force: true });
    const IPV4_ADDRESS = "10.141.1.1/24";
    await page.getByLabel("IPv4 address").fill(IPV4_ADDRESS);

    await page.getByRole("button", { name: "Create override" }).first().click();
    await page.getByLabel("Custom").last().check({ force: true });
    const IPV6_ADDRESS = "2001:db8::1/64";
    await page.getByLabel("IPv6 address").fill(IPV6_ADDRESS);

    const options = ["false", "true"];
    await checkAllOptions(page, "IPv4 NAT", options);
    await checkAllOptions(page, "IPv6 NAT", options);
  });

  test("set OVN bridge MTU and hardware address", async ({ page }) => {
    await visitNetworkConfiguration(page, "Bridge");

    const MTU = "1300";
    await setTextarea(page, "MTU", MTU);

    const HARDWARE_ADDRESS = "00:11:22:33:44:55";
    await setTextarea(page, "Hardware address", HARDWARE_ADDRESS);
  });

  test("configure OVN network DNS settings", async ({ page }) => {
    await visitNetworkConfiguration(page, "DNS");

    const DNS_DOMAIN = "example.com";
    await setTextarea(page, "DNS domain", DNS_DOMAIN);

    const DNS_SEARCH = "search.example.com";
    await setTextarea(page, "DNS search", DNS_SEARCH);
  });

  test("set OVN network IPv4 DHCP and L3 options", async ({ page }) => {
    await visitNetworkConfiguration(page, "IPv4");

    const options = ["false", "true"];
    await checkAllOptions(page, "IPv4 DHCP", options);
    await checkAllOptions(page, "IPv4 L3 only", options);
  });

  test("configure OVN network IPv6 DHCP and L3 settings", async ({ page }) => {
    await visitNetworkConfiguration(page, "IPv6");

    const options = ["false", "true"];
    for (const option of options) {
      await page
        .getByRole("combobox", { name: "IPv6 DHCP", exact: true })
        .selectOption(option);
    }
    await checkAllOptions(page, "IPv6 DHCP stateful", options);
    await checkAllOptions(page, "IPv6 L3 only", options);
  });
});

test("create network forward for specified network", async ({ page }) => {
  await createNetworkForward(page, network);
});
