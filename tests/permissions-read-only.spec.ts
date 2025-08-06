import { test, expect } from "./fixtures/lxd-test";
import { randomInstanceName, visitInstance } from "./helpers/instances";
import { gotoURL } from "./helpers/navigate";
import { execSync } from "child_process";
import { randomProfileName, visitProfile } from "./helpers/profile";
import { randomNetworkName, visitNetwork } from "./helpers/network";
import { randomPoolName, visitPool } from "./helpers/storagePool";
import {
  randomIsoName,
  randomVolumeName,
  visitVolume,
} from "./helpers/storageVolume";
import { randomNetworkAclName, visitNetworkAcl } from "./helpers/network-acls";
import { randomGroupName } from "./helpers/permission-groups";
import { randomIdentityName } from "./helpers/permission-identities";
import { openInstancePanel } from "./helpers/instancePanel";

test.beforeEach(() => {
  test.skip(
    Boolean(process.env.CI),
    "This suite is currently only run manually to test View-Only user permissions.",
  );
});

test.describe("Given a user with Viewer Server permissions...", () => {
  const ISO_FILE = "./tests/fixtures/foo.iso";

  const instanceName = randomInstanceName();
  const profileName = randomProfileName();
  const networkName = randomNetworkName();
  const poolName = randomPoolName();
  const volumeName = randomVolumeName();
  const customISOName = randomIsoName();
  const aclName = randomNetworkAclName();
  const identityName = randomIdentityName();
  const groupName = randomGroupName();
  const idpGroupName = "idp-" + randomGroupName();

  test.beforeAll(() => {
    try {
      console.log(
        "[Switch Project]",
        execSync(`lxc project switch default`).toString(),
      );
      console.log(
        "[Instance Created]",
        execSync(`lxc init ubuntu:24.04 ${instanceName}`).toString(),
      );
      console.log(
        "[Profile Created]",
        execSync(`lxc profile create ${profileName}`).toString(),
      );
      console.log(
        "[Network Created]",
        execSync(`lxc network create ${networkName}`).toString(),
      );
      console.log(
        "[Storage Pool Created]",
        execSync(`lxc storage create ${poolName} dir`).toString(),
      );
      console.log(
        "[Custom Volume Created]",
        execSync(
          `lxc storage volume create ${poolName} ${volumeName}`,
        ).toString(),
      );
      console.log(
        "[Custom ISO Imported]",
        execSync(
          `lxc storage volume import ${poolName} ${ISO_FILE} ${customISOName}`,
        ).toString(),
      );
      console.log(
        "[ACL Created]",
        execSync(`lxc network acl create ${aclName}`).toString(),
      );
      console.log(
        "[Add Network ACL Rule]",
        execSync(
          `lxc network acl rule add ${aclName} ingress action=allow`,
        ).toString(),
      );
      console.log(
        "[Identity Trusted]",
        execSync(`lxc auth identity create tls/${identityName}`).toString(),
      );
      console.log(
        "[Group Created]",
        execSync(`lxc auth group create ${groupName}`).toString(),
      );
      console.log(
        "[IDP Group Created]",
        execSync(
          `lxc auth identity-provider-group create ${idpGroupName}`,
        ).toString(),
      );
    } catch (err) {
      console.error("Error occurred:", err);
    }
  });

  test.afterAll(() => {
    try {
      console.log(
        "[Instance Deleted]",
        execSync(`lxc delete ${instanceName} --force`).toString(),
      );
      console.log(
        "[Profile Deleted]",
        execSync(`lxc profile delete ${profileName}`).toString(),
      );
      console.log(
        "[Network Deleted]",
        execSync(`lxc network delete ${networkName}`).toString(),
      );
      console.log(
        "[Storage Volume Deleted]",
        execSync(
          `lxc storage volume delete ${poolName} ${volumeName}`,
        ).toString(),
      );
      console.log(
        "[Custom ISO Volume Deleted]",
        execSync(
          `lxc storage volume delete ${poolName} ${customISOName}`,
        ).toString(),
      );
      console.log(
        "[Storage Pool Deleted]",
        execSync(`lxc storage delete ${poolName}`).toString(),
      );
      console.log(
        "[ACL Deleted]",
        execSync(`lxc network acl delete ${aclName}`).toString(),
      );
      console.log(
        "[Identity Untrusted]",
        execSync(`lxc auth identity delete tls/${identityName}`).toString(),
      );
      console.log(
        "[Group Deleted]",
        execSync(`lxc auth group delete ${groupName}`).toString(),
      );
      console.log(
        "[IDP Group Deleted]",
        execSync(
          `lxc auth identity-provider-group delete ${idpGroupName}`,
        ).toString(),
      );
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  });

  test("Cannot interact with instances", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByRole("link", { name: "Instances", exact: true }).click();

    await expect(
      page.getByRole("button", { name: "Create instance" }),
    ).toBeDisabled();
    const title = await page
      .getByRole("button", { name: "Create instance" })
      .getAttribute("title");
    expect(title).toContain("You do not have permission to create instances");

    // Bulk actions on instance list page
    await page
      .locator("#instances-table span")
      .filter({ hasText: "Select all" })
      .click();
    await expect(
      page.getByRole("button", { name: "Start", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Restart", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Freeze", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Stop", exact: true }),
    ).toBeDisabled();
    await page
      .locator("#instances-table span")
      .filter({ hasText: "Select all" })
      .click();

    // Cannot start, restart, pause or stop instances from the instance list page on hover.
    await page.getByPlaceholder("Search").click();
    await page.getByPlaceholder("Search").fill(instanceName);
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    await page
      .locator("#instances-table")
      .getByRole("rowheader", { name: `Select ${instanceName} default` })
      .hover();
    await expect(
      page.getByRole("button", { name: "Start", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: "You do not have permission to restart this instance",
        exact: true,
      }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: "You do not have permission to freeze this instance",
        exact: true,
      }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: "You do not have permission to stop this instance",
        exact: true,
      }),
    ).toBeDisabled();

    // Cannot start, restart, pause or stop instances from the instance detail panel.
    await openInstancePanel(page, instanceName);
    await expect(
      page.getByRole("button", { name: "Start", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: "You do not have permission to restart this instance",
        exact: true,
      }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: "You do not have permission to freeze this instance",
        exact: true,
      }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: "You do not have permission to stop this instance",
        exact: true,
      }),
    ).toBeDisabled();

    // Cannot start, restart, pause or stop instances from the detail page.
    await visitInstance(page, instanceName);
    await expect(
      page.getByRole("button", { name: "Start", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: "You do not have permission to restart this instance",
        exact: true,
      }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: "You do not have permission to freeze this instance",
        exact: true,
      }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: "You do not have permission to stop this instance",
        exact: true,
      }),
    ).toBeDisabled();

    // Cannot Migrate, Create Images from Instances, Copy, Export or stop Delete instances from the detail page.
    await expect(
      page.getByRole("button", { name: "Migrate", exact: true }),
    ).toBeDisabled();
    await expect(page.getByLabel("Create Image")).toBeDisabled();
    await expect(page.getByLabel("Copy")).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Export", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Delete", exact: true }),
    ).toBeDisabled();
  });

  test("Cannot interact with Profiles", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByText("Profiles", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Create profile" }),
    ).toBeDisabled();

    await visitProfile(page, profileName);
    await expect(page.getByRole("button", { name: "Delete" })).toBeDisabled();
    await page.getByTestId("tab-link-Configuration").click();
    await expect(page.getByLabel("Description")).toBeDisabled();
  });

  test("Cannot interact with Networks", async ({ page }) => {
    await gotoURL(page, "/ui/");

    // Networks
    await page.getByText("Networking", { exact: true }).click();
    await page.getByText("Networks", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Create network" }),
    ).toBeDisabled();

    await visitNetwork(page, networkName);
    await expect(
      page.getByRole("button", { name: "Delete network" }),
    ).toBeDisabled();

    await page.getByTestId("tab-link-Forwards").click();
    await expect(
      page.getByRole("button", { name: "Create forward" }),
    ).toBeDisabled();

    // Network ACLs
    await page.getByRole("link", { name: "ACLs" }).click();
    await expect(
      page.getByRole("button", { name: "Create ACL" }),
    ).toBeDisabled();

    await visitNetworkAcl(page, aclName);
    await expect(
      page.getByRole("button", { name: "Delete ACL" }),
    ).toBeDisabled();

    await expect(
      page.getByRole("button", { name: "Edit rule" }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Remove rule" }),
    ).toBeDisabled();
  });

  test("Cannot interact with Storage", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByText("Storage", { exact: true }).click();

    // Storage Pools
    await page.getByText("Pools", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Create pool" }),
    ).toBeDisabled();
    await visitPool(page, poolName);
    await expect(
      page.getByRole("button", { name: "Delete pool" }),
    ).toBeDisabled();
    await page.getByTestId("tab-link-Configuration").click();
    await expect(page.getByLabel("Description")).toBeDisabled();

    // Storage Volumes
    await page
      .getByLabel("main navigation", { exact: true })
      .getByRole("link", { name: "Volumes" })
      .click();
    await expect(
      page.getByRole("button", { name: "Create volume" }),
    ).toBeDisabled();

    await visitVolume(page, volumeName);
    await page.getByTestId("tab-link-Configuration").click();
    await expect(page.getByLabel("Size", { exact: true })).toBeDisabled();

    await page.getByTestId("tab-link-Snapshots").click();
    await expect(
      page.getByRole("button", { name: "Create snapshot" }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "See configuration" }),
    ).toBeDisabled();

    // Custom ISOs
    await page.getByText("Custom ISOs", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Upload custom ISO" }),
    ).toBeDisabled();

    await page.getByPlaceholder("Search").click();
    await page.getByPlaceholder("Search").fill(customISOName);
    await expect(page.getByRole("link", { name: poolName })).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "You do not have permission to create instances",
      }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: "You do not have permission to delete this volume",
      }),
    ).toBeDisabled();

    //Buckets
    await page.getByText("Buckets", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Create bucket" }),
    ).toBeDisabled();
  });

  test("Cannot interact with Images", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByText("Images", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Upload image" }),
    ).toBeDisabled();
  });

  test("Cannot interact with the Project", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByRole("button", { name: "default" }).click();
    await expect(
      page.getByRole("button", { name: "Create project" }),
    ).toBeDisabled();
    await page.getByRole("button", { name: "default" }).click();

    await page.getByText("Configuration", { exact: true }).click();
    await expect(page.getByLabel("Description")).toBeDisabled();
  });

  test("Cannot interact with Server settings", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByText("Server", { exact: true }).click();
    await page.getByTestId("tab-link-Clustering").click();
    await expect(
      page.getByRole("button", { name: "Enable clustering" }),
    ).toBeDisabled();

    await page.getByText("Settings", { exact: true }).click();
    await page.waitForSelector(
      "text=You do not have permission to view or edit server settings",
    );
  });

  test("Cannot interact with Identities", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByText("Permissions", { exact: true }).click();
    await page.getByText("Identities", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Create TLS identity" }),
    ).toBeDisabled();

    await page.getByPlaceholder("Filter").click();
    await page.getByPlaceholder("Filter").fill(identityName);
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Manage groups")).toBeDisabled();
    await expect(page.getByLabel("Delete identity")).toBeDisabled();
  });

  test("Cannot interact with Groups", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByText("Permissions", { exact: true }).click();
    await page.getByText("Groups", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Create group" }),
    ).toBeDisabled();

    await page.getByPlaceholder("Search").click();
    await page.getByPlaceholder("Search").fill(groupName);
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("button", { name: "Edit group" }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Delete group" }),
    ).toBeDisabled();

    // IDP Groups
    await page.getByText("IDP groups", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Create IDP group" }),
    ).toBeDisabled();

    await page.getByPlaceholder("Search").click();
    await page.getByPlaceholder("Search").fill(idpGroupName);
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Edit IDP group details")).toBeDisabled();
    await expect(page.getByLabel("Delete IDP group")).toBeDisabled();
  });
});
