import { expect, test } from "./fixtures/lxd-test";
import { gotoURL } from "./helpers/navigate";
import {
  deleteInstance,
  forceStopInstance,
  visitInstance,
} from "./helpers/instances";
import { createPool, deletePool } from "./helpers/storagePool";
import {
  createNetwork,
  createNetworkLocalPeering,
  deleteLocalPeerings,
  deleteNetwork,
  prepareCreateNetwork,
  submitCreateNetwork,
  visitNetwork,
  createOvnUplink,
  makeNetworkOvnUplink,
} from "./helpers/network";
import { createVolume, deleteVolume } from "./helpers/storageVolume";
import { setOption } from "./helpers/configuration";
import { getClipPosition } from "./helpers/doc-screenshots";
import { openInstancePanel } from "./helpers/instancePanel";
import { deleteNetworkAcl } from "./helpers/network-acls";

test.beforeEach(() => {
  test.skip(
    !!process.env.CI && !process.env.ENABLE_SCREENSHOTS,
    "This suite is only run manually to create screenshots for the documentation",
  );
});

test("instances", async ({ page }) => {
  const pool = "other-pool";
  const volume = "CustomVolume";
  const instance = "comic-glider";

  await page.setViewportSize({ width: 1440, height: 800 });
  await createPool(page, pool, "dir");
  await createVolume(page, volume);
  await gotoURL(page, "/ui/");
  await page.getByText("Instances", { exact: true }).click();
  await page.getByRole("button", { name: "Create instance" }).click();
  await page.getByPlaceholder("Enter name").fill(instance);
  await page.getByRole("button", { name: "Browse images" }).click();
  await page
    .locator("tr")
    .filter({ hasText: "Ubuntu24.04 LTS" })
    .first()
    .getByRole("button")
    .click();
  await page.getByText("Disk").click();
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: "tests/screenshots/doc/images/instances/create_instance_form_disk_devices.png",
    clip: getClipPosition(240, 0, 1280, 675),
  });
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_attach_to_instance_1.png",
    clip: getClipPosition(240, 0, 1280, 675),
  });

  await page.getByTitle("Create override").click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/instances/create_instance_form.png",
    clip: getClipPosition(240, 0, 1360, 520),
  });

  await page.getByRole("button", { name: "Attach disk device" }).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_attach_to_instance_2.png",
    clip: getClipPosition(390, 270, 950, 520),
  });

  await page.setViewportSize({ width: 1440, height: 500 });
  await page.getByRole("button", { name: "Attach custom volume" }).click();
  await page.getByRole("button", { name: "Select" }).first().waitFor();
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_attach_to_instance_3.png",
    clip: getClipPosition(85, 20, 1350, 470),
  });
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.getByLabel("Close active modal").click();

  await page.getByText("Network", { exact: true }).click();
  await expect(page.getByText("Attach network")).toBeVisible();
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_add_to_instance.png",
    clip: getClipPosition(240, 0, 1280, 675),
  });

  await page.getByRole("button", { name: "Attach network" }).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_attach_instance.png",
    clip: getClipPosition(490, 70, 1245, 340),
  });

  await page
    .getByRole("button", { name: "Apply changes", exact: true })
    .click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByText(`Created instance ${instance}.`).click();
  await visitInstance(page, instance);

  await page.screenshot({
    path: "tests/screenshots/doc/images/instances/instance_overview_page.png",
    clip: getClipPosition(240, 0, 1420, 600),
  });

  await page.getByRole("button", { name: "Migrate", exact: true }).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/instances/move_instance_modal.png",
    clip: getClipPosition(390, 250, 1040, 550),
  });

  await page
    .getByText("Move instance root storage to a different pool")
    .click();
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: "tests/screenshots/doc/images/instances/move_instance_modal_2.png",
    clip: getClipPosition(80, 80, 1340, 650),
  });

  await page.getByText(pool).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/instances/move_confirmation_modal.png",
    clip: getClipPosition(350, 300, 1090, 490),
  });

  await deleteVolume(page, volume.toLowerCase());
  await deleteInstance(page, instance);
  await deletePool(page, pool);
});

test("networks", async ({ page }) => {
  const network = "BridgeNetwork";
  const networkACL = network + "-ACL";
  await page.setViewportSize({ width: 1440, height: 800 });

  await prepareCreateNetwork(page, network, "bridge");
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_create.png",
    clip: getClipPosition(240, 0, 1420, 750),
  });
  await submitCreateNetwork(page, network);

  await visitNetwork(page, network);
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_configuration.png",
    clip: getClipPosition(240, 0, 1130, 750),
  });

  await page.getByRole("link", { name: "Leases" }).click();
  await page.getByText("Hostname").waitFor();
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_view_leases.png",
    clip: getClipPosition(240, 0, 850, 250),
  });

  //Network ACLs
  await page.getByText("ACLs").click();
  await page.getByText("Create ACL").click();
  await page.getByPlaceholder("Enter name").click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_ACL_create.png",
    clip: getClipPosition(240, 0, 880, 360),
  });

  await page.getByPlaceholder("Enter name").fill(networkACL);
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByTestId("notification-close-button").click();
  await page.getByRole("link", { name: networkACL }).click();
  await page.getByText("Click the ACL name").waitFor();
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_ACLs.png",
    clip: getClipPosition(240, 0, 850, 590),
  });

  await page.setViewportSize({ width: 1440, height: 2000 });
  await page
    .getByRole("button", { name: "Add ingress rule", exact: true })
    .click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_ACL_addrule.png",
    clip: getClipPosition(430, 450, 1010, 1555),
  });
  await page.getByText("Add rule").click();
  await page.getByText("Save 1 change").click();

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_ACL_remove_edit.png",
    clip: getClipPosition(250, 300, 1160, 560),
  });

  await page.getByText("Delete ACL").click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await deleteNetwork(page, network);
});

test("network peering", async ({ page }) => {
  const uplinkNetwork = "BridgeNetwork1";
  const network1 = "OVNNetwork";
  const network2 = "OVNNetwork2";
  const network3 = "OVNNetwork3";
  const networkACL = network1 + "-ACL";
  await page.setViewportSize({ width: 1440, height: 800 });
  await gotoURL(page, "/ui/");

  // Create ACL
  await page.getByText("Networking").click();
  await page.getByText("ACLs").click();
  await page.getByText("Create ACL").click();
  await page.getByPlaceholder("Enter name").fill(networkACL);
  await page
    .getByRole("button", { name: "Add ingress rule", exact: true })
    .click();
  await page.getByText("Add rule").click();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByTestId("notification-close-button").click();

  // Create network
  await createOvnUplink(page, uplinkNetwork);
  await createNetwork(page, network1, "ovn", {
    hasMemberSpecificParents: false,
    uplink: uplinkNetwork,
    networkACL,
    ipv6: "none",
  });
  await createNetwork(page, network2, "ovn");
  await createNetwork(page, network3, "ovn");
  await createNetworkLocalPeering(page, "LocalPeering1", network1, network2);
  await createNetworkLocalPeering(
    page,
    "LocalPeering2",
    network1,
    network3,
    true,
  );
  await page.getByTestId("notification-close-button").click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_list_local_peerings.png",
    clip: getClipPosition(240, 0, 1440, 450),
  });

  await page.getByRole("button", { name: "Create local peering" }).click();
  await page.getByRole("textbox", { name: "* Name" }).fill("LocalPeering3");
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_create_local_peerings.png",
    clip: getClipPosition(910, 0, 1440, 800),
  });
  await page.getByRole("button", { name: "Cancel" }).click();

  await page
    .getByRole("button", { name: "Edit local peering" })
    .first()
    .click();
  await page.waitForTimeout(200);
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_edit_local_peerings.png",
    clip: getClipPosition(240, 0, 1440, 800),
  });

  await deleteLocalPeerings(page, network1, "LocalPeering1");
  await deleteLocalPeerings(page, network1, "LocalPeering2");
  await deleteNetwork(page, network3);
  await deleteNetwork(page, network2);
  await deleteNetwork(page, network1);
  await deleteNetwork(page, uplinkNetwork);
  await deleteNetworkAcl(page, networkACL);
});

test("storage pools", async ({ page }) => {
  const poolName = "pool1";
  await page.setViewportSize({ width: 1440, height: 800 });
  await gotoURL(page, "/ui/");
  await page.getByText("Storage").click();
  await page.getByRole("link", { name: "Pools" }).click();
  await page.getByText("Create pool").click();

  await page.getByPlaceholder("Enter name").fill(poolName);
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_pools_create.png",
    clip: getClipPosition(240, 0, 1420, 750),
  });

  await page
    .getByLabel("Storage pool form navigation")
    .getByText("ZFS")
    .click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_pools_create_ZFS_driver.png",
    clip: getClipPosition(240, 0, 1420, 750),
  });
});

test("storage volumes", async ({ page }) => {
  const poolName = "pool1";
  const volumeName = "CustomVol1";
  await page.setViewportSize({ width: 1440, height: 800 });
  await createPool(page, poolName);

  await page.getByRole("link", { name: "Volumes", exact: true }).click();
  await page.getByText("Create volume").click();
  await page.getByRole("button", { name: "Upload volume file" }).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_import.png",
    clip: getClipPosition(445, 200, 1000, 605),
  });
  await page.getByLabel("Close active modal").click();

  await page.getByPlaceholder("Enter name").fill(volumeName);
  await page.getByLabel("Storage pool", { exact: true }).click();
  await page.getByLabel("sub").getByText(poolName).click();

  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_create.png",
    clip: getClipPosition(240, 0, 1420, 750),
  });

  await page.getByPlaceholder("Enter value").fill("100");
  await page.getByLabel("Select disk size unit").selectOption("MB");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByTestId("notification-close-button").click();
  await page.getByRole("link", { name: volumeName }).click();
  await page.getByText("Overview").waitFor();
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_overview.png",
    clip: getClipPosition(240, 0, 1420, 550),
  });

  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_rename.png",
    clip: getClipPosition(230, 0, 630, 40),
  });

  await page.getByLabel("Copy volume").click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_copy_modal.png",
    clip: getClipPosition(445, 130, 1000, 680),
  });
  await page.getByLabel("Close active modal").click();
  await page.getByTitle("Export volume").click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_export.png",
    clip: getClipPosition(445, 100, 1000, 710),
  });
  await page.getByLabel("Close active modal").click();

  await deleteVolume(page, volumeName);
  await deletePool(page, poolName);
});

test("storage volume snapshots", async ({ page }) => {
  const poolName = "pool1";
  const volumeName = "CustomVol1";
  const snapshot = "snapshot1";

  await page.setViewportSize({ width: 1440, height: 800 });
  await createPool(page, poolName);
  await createVolume(page, volumeName);

  await page.getByRole("link", { name: "Volumes", exact: true }).click();
  await page.getByRole("link", { name: volumeName }).click();
  await page.getByTestId("tab-link-Snapshots").click();
  await expect(
    page.getByText("There are no snapshots for this volume."),
  ).toBeVisible();
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_snapshots_tab.png",
    clip: getClipPosition(240, 0, 1420, 350),
  });

  await page.getByRole("button", { name: "Create snapshot" }).click();
  await page.getByLabel("Snapshot name").click();
  await page.getByLabel("Snapshot name").fill(snapshot);
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_snapshots_create.png",
    clip: getClipPosition(480, 250, 950, 560),
  });

  await page.getByRole("button", { name: "Create snapshot" }).last().click();
  await expect(
    page.getByText(`Snapshot ${snapshot} created for volume ${volumeName}.`),
  ).toBeVisible();
  await page.reload();
  await page.getByText("Showing 1 out of 1 snapshot").waitFor();
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_snapshots_list.png",
    clip: getClipPosition(240, 0, 1420, 320),
  });

  await page.getByRole("button", { name: "See configuration" }).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_snapshots_configuration.png",
    clip: getClipPosition(280, 190, 1165, 640),
  });

  await deleteVolume(page, volumeName.toLowerCase());
  await deletePool(page, poolName);
});

test("LXD - Tutorial folder", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  const projectButton = page
    .getByTitle("Select project (default)", { exact: true })
    .getByRole("button");
  const instance = "Instance1";
  await gotoURL(page, "/ui/");
  await expect(projectButton).toBeVisible();
  await projectButton.click();
  await page.getByRole("button", { name: "Create project" }).waitFor();
  await page.getByRole("button", { name: "Create project" }).click();
  await page.getByText("Project name").click();
  await projectButton.click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/create_project.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  await projectButton.click();

  await page.getByRole("link", { name: "Instances", exact: true }).click();
  await page.getByRole("button", { name: "Create instance" }).click();
  await page.getByPlaceholder("Enter name").fill("Ubuntu-vm");
  await page.getByRole("button", { name: "Browse images" }).click();
  await page
    .locator("tr")
    .filter({ hasText: "Ubuntu24.04 LTSnoblealldefaultUbuntuRemoteSelect" })
    .getByRole("button")
    .click();

  await page.getByLabel("Instance type").click();
  await page.getByLabel("Instance type").selectOption("VM");
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/create_vm.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  await page.getByLabel("Instance type").click();
  await page.getByLabel("Instance type").selectOption("Container");
  await page.getByPlaceholder("Enter name").fill(instance);
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/create_instance.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  await page.getByText("Resource limits").click();
  await page
    .getByRole("row", { name: "Exposed CPU limit" })
    .getByRole("button")
    .click();
  await page.getByPlaceholder("Number of exposed cores").fill("1");
  await page
    .getByRole("row", { name: "Memory limit" })
    .getByRole("button")
    .click();
  await page.getByPlaceholder("Enter value").fill("4");
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/resource_limits.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  await page.getByRole("button", { name: "Create and start" }).click();
  await page.getByTestId("notification-close-button").click();
  await page.getByText(`Created and started instance ${instance}.`).waitFor();
  await openInstancePanel(page, instance);
  await page.getByText("Instance summary").click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/instance_summary.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  await visitInstance(page, instance);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Disk").click();
  await page.getByRole("button", { name: "Attach disk device" }).click();
  await page.getByRole("button", { name: "Mount host path" }).click();
  await page
    .getByPlaceholder("Enter full path (e.g. /home)")
    .fill("default/tutorial_volume");
  await page.getByPlaceholder("Enter full path (e.g. /data)").fill("/data");
  await page.getByRole("button", { name: "Attach", exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 850 });
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/add_disk_device.png",
    clip: getClipPosition(0, 0, 1440, 810),
  });

  await page.setViewportSize({ width: 1440, height: 800 });
  await page.locator("#form-footer span").first().click();
  await page.waitForTimeout(5000);
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/yaml_configuration.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByTestId("tab-link-Terminal").click();
  await page.waitForTimeout(2000);
  await page.keyboard.type("exit");
  await page.keyboard.press("Enter");
  await page.getByText(`The connection was closed abnormally`).waitFor();
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/broken_terminal.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  await deleteInstance(page, instance);
});

test("LXD - Tutorial - Graphical consoles", async ({ page }) => {
  test.setTimeout(180000);
  // Desktop vm
  await page.setViewportSize({ width: 1440, height: 800 });

  const vminstance = "Ubuntu-desktop";
  await gotoURL(page, "/ui/");
  await page.getByText("Instances", { exact: true }).click();
  await page.getByRole("button", { name: "Create instance" }).click();
  await page.getByPlaceholder("Enter name").fill(vminstance);
  await page.getByRole("button", { name: "Browse images" }).click();
  await page
    .locator("tr")
    .filter({ hasText: "Ubuntunobledesktopvirtual-" })
    .first()
    .getByRole("button", { name: "Select" })
    .click();

  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/create_desktop_vm.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  await page.getByText("Resource limits").click();
  await page
    .getByRole("row", { name: "Memory limit" })
    .getByRole("button")
    .click();
  await page
    .getByRole("row", { name: "Exposed CPU limit" })
    .getByRole("button")
    .click();
  await page.getByPlaceholder("Number of exposed cores").fill("4");
  await page.getByPlaceholder("Enter value").fill("8");
  await page
    .getByRole("button", { name: "Create and start", exact: true })
    .click();
  await page.getByTestId("notification-close-button").click();
  await page.getByRole("link", { name: vminstance }).first().waitFor();
  await page.getByText(`Created and started instance ${vminstance}.`).waitFor();
  await visitInstance(page, vminstance);
  await page.getByText("General").click();
  await page.getByTestId("tab-link-Console").click();
  await page.waitForTimeout(60000);
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/desktop_console.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  // Open File Explorer and navigate to /Documents
  await page.mouse.click(300, 280, { delay: 1000 });
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(1000);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);

  // Creates new folder
  await page.mouse.click(725, 525, { button: "right", delay: 1000 });
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(1000);
  await page.keyboard.press("ArrowUp");
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);
  await page.keyboard.type("hello_world");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/hello_world_desktop.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  await forceStopInstance(page, vminstance);
  await deleteInstance(page, vminstance);
});

test("LXD - UI Folder - Project", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await gotoURL(page, "/ui/");

  // Project Screenshots
  await page.waitForTimeout(1000);
  await page
    .getByTitle("Select project (default)", { exact: true })
    .getByRole("button")
    .click();
  await page.getByRole("button", { name: "Create project" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByPlaceholder("Enter name").fill("my-project");
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/create_project.png",
    clip: getClipPosition(240, 0, 1440, 960),
  });

  await page.getByPlaceholder("Enter name").fill("my-restricted-project");
  await page.getByText("Allow custom restrictions on a project level").click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/create_restr_project1.png",
    clip: getClipPosition(240, 0, 1440, 760),
  });

  await page
    .getByRole("navigation", { name: "Project form navigation" })
    .getByText("Instances")
    .click();
  await setOption(page, "Snapshot creation", "allow");
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/create_restr_project2.png",
    clip: getClipPosition(240, 0, 1440, 760),
  });
});

test("LXD - UI Folder - Instances", async ({ page }) => {
  const instance = "Ubuntu-vm";
  await page.setViewportSize({ width: 1440, height: 800 });
  await gotoURL(page, "/ui/");

  //Instance Screenshots
  await page.getByRole("link", { name: "Instances", exact: true }).click();
  await page.getByRole("button", { name: "Create instance" }).click();
  await page.getByPlaceholder("Enter name").fill("Ubuntu-container");
  await page.getByRole("button", { name: "Browse images" }).click();
  await page
    .locator("tr")
    .filter({ hasText: "Ubuntu24.04 LTSnoblealldefaultUbuntuRemoteSelect" })
    .getByRole("button")
    .click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/create_instance_ex1.png",
    clip: getClipPosition(240, 0, 1440, 760),
  });

  await page.getByPlaceholder("Enter name").fill(instance);
  await page.getByLabel("Instance type").click();
  await page.getByLabel("Instance type").selectOption("VM");
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/create_instance_ex2.png",
    clip: getClipPosition(240, 0, 1440, 760),
  });

  await page.setViewportSize({ width: 1000, height: 800 });
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/routed_nic_create_instance.png",
    clip: getClipPosition(240, 0, 1440, 760),
  });
  await page.setViewportSize({ width: 1440, height: 800 });

  await page.getByText("Disk").click();
  await page.getByTitle("Create override").click();
  await page.getByPlaceholder("Enter value").fill("30");
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/create_instance_ex2-2.png",
    clip: getClipPosition(240, 0, 1440, 760),
  });

  await page.getByText("Resource limits").click();
  await page
    .getByRole("row", { name: "Exposed CPU limit" })
    .getByRole("button")
    .click();
  await page.getByPlaceholder("Number of exposed cores").fill("1");
  await page
    .getByRole("row", { name: "Memory limit" })
    .getByRole("button")
    .click();
  await page.getByPlaceholder("Enter value").fill("8");
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/create_instance_ex3.png",
    clip: getClipPosition(240, 0, 1440, 760),
  });

  await page.getByRole("button", { name: "Create and start" }).click();
  await page.getByRole("link", { name: instance }).first().waitFor();

  await visitInstance(page, instance);
  await page.getByTestId("tab-link-Configuration").click();
  await page.getByText("Resource limits").click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/limits_memory_example.png",
    clip: getClipPosition(240, 0, 1440, 760),
  });
  await page.getByTestId("tab-link-Snapshots").click();
  await page.getByRole("button", { name: "See configuration" }).click();
  await page
    .getByRole("row", { name: "Schedule Schedule for" })
    .getByRole("button")
    .click();
  await page.getByPlaceholder("Enter cron expression").fill("0 6 * * *");
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/snapshots_cron.png",
    clip: getClipPosition(280, 50, 1165, 770),
  });
  await page.getByText("Choose interval").click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/snapshots_daily.png",
    clip: getClipPosition(280, 110, 1165, 715),
  });
  await page.getByLabel("Close active modal").click();
  await forceStopInstance(page, instance);
  await deleteInstance(page, instance);
});

test("LXD - UI Folder - Networks", async ({ page }) => {
  const network1 = "lxdbr0-1";
  const network2 = "ovntest-1";
  await page.setViewportSize({ width: 1440, height: 800 });

  // Network forwards screenshots
  await createNetwork(page, network1, "bridge", {
    ipv4: "10.0.0.1/24",
    ipv6: "none",
  });
  await page.getByRole("link", { name: network1, exact: true }).click();
  await page.getByText("IPv4 address", { exact: true }).click();
  await page.getByText("/24").getByRole("button").click();
  let networkSubnet = await page.inputValue("input#ipv4_address");
  let listenAddress = networkSubnet.replace("1/24", "1");
  let targetAddress = networkSubnet.replace("1/24", "3");
  await page.getByRole("link", { name: "Forwards" }).click();
  await page.getByTitle("Create forward").click();
  await page.getByLabel("Listen address").fill(listenAddress);
  await page.getByLabel("Default target address").fill(targetAddress);
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/forward_create.png",
    clip: getClipPosition(240, 0, 1440, 760),
  });
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/forward_create_bridge.png",
    clip: getClipPosition(240, 0, 1440, 760),
  });

  await page.getByRole("button", { name: "Add port", exact: true }).click();
  await page.getByLabel("Port 0 listen port").fill("80");
  await page.getByLabel("Port 0 target port").fill("443");
  await page.getByLabel("Port 0 target address").fill(targetAddress);
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/forward_create_port.png",
    clip: getClipPosition(240, 0, 1440, 760),
  });

  await page.getByLabel("Delete port 0").click();
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByTestId("notification-close-button").click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/forward_delete.png",
    clip: getClipPosition(240, 0, 1440, 360),
  });

  const updateAddress = networkSubnet.replace("1/24", "4");
  await page.getByRole("link", { name: "Edit network forward" }).click();
  await page.getByRole("button", { name: "Add port" }).click();
  await page.getByLabel("Port 0 listen port").fill("80");
  await page.getByLabel("Port 0 target port").fill("443");
  await page.getByLabel("Port 0 target address").fill(updateAddress);
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/forward_edit_ex2.png",
    clip: getClipPosition(240, 0, 1440, 760),
  });

  await page.getByRole("button", { name: "Update" }).click();
  await page.getByTestId("notification-close-button").click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/forward_edit_ex1.png",
    clip: getClipPosition(240, 0, 1440, 360),
  });

  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/forwards_view.png",
    clip: getClipPosition(240, 0, 1440, 360),
  });

  await makeNetworkOvnUplink(page, network1, {
    CIDR: "10.0.0.2/24",
    ovnIpv4Range: "10.0.0.2-10.0.0.50",
    dhcpIpv4Range: "10.0.0.100-10.0.0.150",
  });
  await createNetwork(page, network2, "ovn", {
    ipv6: "none",
    uplink: network1,
  });
  await visitNetwork(page, network2);

  await page.getByText("/24").getByRole("button").click();
  networkSubnet = await page.inputValue("input#ipv4_address");
  listenAddress = networkSubnet.replace("1/24", "1");
  targetAddress = networkSubnet.replace("1/24", "3");
  await page.getByRole("link", { name: "Forwards" }).click();
  await page.getByTitle("Create forward").click();
  await page.locator("label", { hasText: "Manually enter address" }).click();
  await page.getByLabel("Listen address").fill(listenAddress);
  await page.getByLabel("Default target address").fill(targetAddress);
  await page.screenshot({
    path: "tests/screenshots/doc/images/UI/forward_create_ovn.png",
    clip: getClipPosition(240, 0, 1440, 760),
  });

  await deleteNetwork(page, network2);
  await deleteNetwork(page, network1);
});
