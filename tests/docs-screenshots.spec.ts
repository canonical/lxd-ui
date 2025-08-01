import { expect, test } from "./fixtures/lxd-test";
import { gotoURL } from "./helpers/navigate";
import { deleteInstance, visitInstance } from "./helpers/instances";
import { createPool, deletePool } from "./helpers/storagePool";
import { deleteNetwork, visitNetwork } from "./helpers/network";
import { createVolume, deleteVolume } from "./helpers/storageVolume";

test.beforeEach(() => {
  test.skip(
    Boolean(process.env.CI),
    "This suite is only run manually to create screenshots for the documentation",
  );
});

// x,y is top left coordinate, xx,yy is bottom right coordinate
// gimp provides the coordinates of the area easily
const getClipPosition = (x: number, y: number, xx: number, yy: number) => {
  return {
    x: x,
    y: y,
    width: xx - x,
    height: yy - y,
  };
};

//Run in a non-clustered backend

test("instances", async ({ page }) => {
  const pool = "other-pool";
  const volume = "CustomVol";
  await createPool(page, pool, "dir");

  const instance = "comic-glider";
  await createVolume(page, volume);
  await gotoURL(page, "/ui/");
  await page.getByText("Instances", { exact: true }).click();
  await page.getByText("Create instance").click();
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

  await page.getByRole("button", { name: "Create override" }).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/instances/create_instance_form.png",
    clip: getClipPosition(240, 0, 1280, 675),
  });

  await page.getByRole("button", { name: "Attach disk device" }).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_attach_to_instance_2.png",
    clip: getClipPosition(310, 230, 900, 480),
  });

  await page.getByRole("button", { name: "Attach custom volume" }).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_attach_to_instance_3.png",
    clip: getClipPosition(20, 20, 1300, 680),
  });
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

  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForSelector(`text=Created instance ${instance}.`);
  await visitInstance(page, instance);

  await page.screenshot({
    path: "tests/screenshots/doc/images/instances/instance_overview_page.png",
    clip: getClipPosition(240, 0, 1280, 600),
  });

  await page.getByRole("button", { name: "Migrate", exact: true }).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/instances/move_instance_modal.png",
    clip: getClipPosition(305, 210, 974, 500),
  });

  await page
    .getByText("Move instance root storage to a different pool")
    .click();
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: "tests/screenshots/doc/images/instances/move_instance_modal_2.png",
    clip: getClipPosition(17, 80, 1262, 630),
  });

  await page.getByText(pool).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/instances/move_confirmation_modal.png",
    clip: getClipPosition(264, 262, 1015, 458),
  });

  await deleteVolume(page, volume.toLowerCase());
  await deleteInstance(page, instance);
  await deletePool(page, pool);
});

test("networks", async ({ page }) => {
  const network = "BridgeNetwork";
  const networkACL = network + "-ACL";
  await gotoURL(page, "/ui/");
  await page.getByText("Networking").click();
  await page.getByText("Networks").click();
  await page.getByText("Create network").click();
  await page.getByPlaceholder("Enter name").fill(network);
  await page.getByLabel("Type").selectOption("bridge");
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_create.png",
    clip: getClipPosition(240, 0, 1420, 750),
  });
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForSelector(`text=Network ${network} created.`);

  await visitNetwork(page, network);
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_configuration.png",
    clip: getClipPosition(240, 0, 1130, 750),
  });

  await page.getByTestId("tab-link-Leases").click();
  await page.waitForSelector(`text=Hostname`);
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_view_leases.png",
    clip: getClipPosition(240, 0, 850, 250),
  });

  //Network ACLs
  await page.getByText("ACLs").click();
  await page.getByText("Create ACL").click();
  await page.waitForSelector('[placeholder="Enter name"]', {
    state: "visible",
  });
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_ACL_create.png",
    clip: getClipPosition(240, 0, 880, 360),
  });

  await page.getByPlaceholder("Enter name").fill(networkACL);
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByTestId("notification-close-button").click();
  await page.getByRole("link", { name: networkACL }).click();
  await page.waitForSelector(`text=Click the ACL name`);
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

test("storage pools", async ({ page }) => {
  const poolName = "pool1";
  page.setViewportSize({ width: 1440, height: 800 });
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
  page.setViewportSize({ width: 1440, height: 800 });
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
  await page.getByLabel("submenu").getByText("pool1").click();

  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_create.png",
    clip: getClipPosition(240, 0, 1420, 750),
  });

  await page.getByPlaceholder("Enter value").fill("100");
  await page.getByLabel("Select disk size unit").selectOption("MB");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByTestId("notification-close-button").click();
  await page.getByRole("link", { name: volumeName }).click();
  await page.waitForSelector(`text=Overview`);
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

  await page.getByRole("button", { name: "Export" }).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_export.png",
    clip: getClipPosition(445, 100, 1000, 710),
  });
  await page.getByLabel("Close active modal").click();

  await deleteVolume(page, volumeName.toLowerCase());
  await deletePool(page, poolName);
});

test("storage volume snapshots", async ({ page }) => {
  const poolName = "pool1";
  const volumeName = "CustomVol1";
  const snapshot = "snapshot1";

  page.setViewportSize({ width: 1440, height: 800 });
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
  await page.waitForSelector(
    `text=Snapshot ${snapshot} created for volume ${volumeName}.`,
  );

  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_snapshots_list.png",
    clip: getClipPosition(240, 0, 1420, 320),
  });

  await page
    .getByRole("row", { name: "Name" })
    .filter({ hasText: snapshot })
    .hover();
  await page.getByLabel("Edit snapshot").click();

  await page.screenshot({
    path: "tests/screenshots/doc/images/storage/storage_volumes_snapshots_configuration.png",
    clip: getClipPosition(480, 250, 950, 560),
  });

  await deleteVolume(page, volumeName.toLowerCase());
  await deletePool(page, poolName);
});

test("LXD - tutorial", async ({ page }) => {
  page.setViewportSize({ width: 1440, height: 800 });

  const instance = "Instance1";
  await gotoURL(page, "/ui/");
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "default", exact: true }).click();
  await page.getByRole("button", { name: "Create project" }).click();
  await page.waitForSelector(`text=Project name`);
  await page.getByRole("button", { name: "default", exact: true }).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/create_project.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  await page.getByRole("button", { name: "default", exact: true }).click();
  await page.getByRole("link", { name: "Instances", exact: true }).click();
  await page.getByText("Create instance").click();
  await page.getByPlaceholder("Enter name").fill("Ubuntu-vm");
  await page.getByRole("button", { name: "Browse images" }).click();
  await page
    .locator("tr")
    .filter({ hasText: "Ubuntu24.04 LTSnoblealldefaultUbuntuSelect" })
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
    .getByRole("row", { name: "Exposed CPU limit Which CPUs" })
    .getByRole("button")
    .click();
  await page.getByPlaceholder("Number of exposed cores").fill("1");
  await page
    .getByRole("row", { name: "Memory limit Usage limit for" })
    .getByRole("button")
    .click();
  await page.getByPlaceholder("Enter value").fill("4");
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/resource_limits.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  await page.getByRole("button", { name: "Create and start" }).click();
  await page.getByTestId("notification-close-button").click();

  await page
    .getByRole("row", {
      name: "Select Instance1 default Name Type Description IPv4 Status Actions",
    })
    .getByLabel("Name")
    .click();
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
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/add_disk_device.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  await page.locator("#form-footer span").first().click();
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/yaml_configuration.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });
  await page.getByRole("button", { name: "Cancel" }).click();

  // Add broken terminal screenshot
  await page.getByTestId("tab-link-Terminal").click();
  await page.waitForTimeout(5000);
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/broken_terminal.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  // -----------------------------------------------------
  // Desktop vm

  const vminstance = "Ubuntu-desktop";
  await gotoURL(page, "/ui/");
  await page.getByText("Instances", { exact: true }).click();
  await page.getByText("Create instance").click();
  await page.getByPlaceholder("Enter name").fill(vminstance);
  await page.getByRole("button", { name: "Browse images" }).click();
  await page
    .locator("tr")
    .filter({
      hasText: "Ubuntunobledesktopvirtual-machineubuntu/noble/desktopLXD",
    })
    .getByRole("button")
    .click();

  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/create_desktop_vm.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });
  await page.getByRole("button", { name: "Create and start" }).click();

  await visitInstance(page, vminstance);
  await page.getByTestId("tab-link-Configuration").click();

  await page.getByText("Disk").click();
  await page.getByRole("button", { name: "Create override" }).click();
  await page.getByPlaceholder("Enter value").fill("30");
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/root_disk_size.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });
  await page.getByRole("button", { name: "Cancel" }).click();

  //desktop console
  await page.getByTestId("tab-link-Console").click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/desktop_console.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  //hello world desktop
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/hello_world_desktop.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  await gotoURL(page, "/ui/");
  await page.getByText("Instances", { exact: true }).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/tutorial/instances.png",
    clip: getClipPosition(0, 0, 1440, 760),
  });

  await deleteInstance(page, instance);
  await deleteInstance(page, vminstance);
});
