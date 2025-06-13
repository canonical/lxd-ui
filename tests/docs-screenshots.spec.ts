import { expect, test } from "./fixtures/lxd-test";
import { gotoURL } from "./helpers/navigate";
import { deleteInstance, visitInstance } from "./helpers/instances";
import { createPool, deletePool } from "./helpers/storagePool";

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

test("instances", async ({ page }) => {
  const pool = "other-pool";
  await createPool(page, pool, "dir");

  const instance = "comic-glider";
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
  await page.screenshot({
    path: "tests/screenshots/doc/images/instances/create_instance_form_disk_devices.png",
    clip: getClipPosition(240, 0, 1280, 675),
  });

  await page.getByRole("button", { name: "Create override" }).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/instances/create_instance_form.png",
    clip: getClipPosition(240, 0, 1280, 675),
  });

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
    clip: getClipPosition(305, 228, 974, 492),
  });

  await page
    .getByText("Move instance root storage to a different pool")
    .click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/instances/move_instance_modal_2.png",
    clip: getClipPosition(17, 80, 1262, 640),
  });

  await page.getByText(pool).click();
  await page.screenshot({
    path: "tests/screenshots/doc/images/instances/move_confirmation_modal.png",
    clip: getClipPosition(264, 262, 1015, 458),
  });

  await deleteInstance(page, instance);
  await deletePool(page, pool);
});

test("networks", async ({ page }) => {
  page.setViewportSize({ width: 1440, height: 750 });
  const network = "lxdbr1";
  await gotoURL(page, "/ui/");
  await page.getByText("Networking").click();
  await page.getByText("Networks").click();
  await page.getByText("Create network").click();
  await page.getByPlaceholder("Enter name").fill(network);
  await page.screenshot({
    path: "tests/screenshots/doc/images/networks/network_create.png",
    clip: getClipPosition(240, 0, 1420, 710),
  });
});
