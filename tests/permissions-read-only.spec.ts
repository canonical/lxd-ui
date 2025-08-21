import { test, expect } from "./fixtures/lxd-test";
import {
  randomInstanceName,
  selectAllInstances,
  visitInstance,
} from "./helpers/instances";
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

test.describe("Given a user with Viewer Server permissions...", () => {
  const ISO_FILE = "./tests/fixtures/foo.iso";

  const instanceName1 = randomInstanceName() + "-1";
  const instanceName2 = randomInstanceName() + "-2";
  const profileName = randomProfileName();
  const networkName = randomNetworkName();
  const poolName = randomPoolName();
  const volumeName = randomVolumeName();
  const customISOName = randomIsoName();
  const aclName = randomNetworkAclName();
  const identityName = randomIdentityName();
  const groupName = randomGroupName();
  const idpGroupName = "idp-" + randomGroupName();

  test.beforeAll(({ lxdVersion }) => {
    if (lxdVersion === "5.0-edge") {
      console.log("Fine-grained permissions not supported on LXD 5.0-edge");
      return;
    }

    try {
      console.log(
        "[Switch Project]",
        execSync(`sudo -E lxc project switch default`).toString(),
      );
      console.log(
        "[Instance 1 Created]",
        execSync(`sudo -E lxc init ubuntu:24.04 ${instanceName1}`).toString(),
      );
      console.log(
        "[Instance 2 Created]",
        execSync(`sudo -E lxc init ubuntu:24.04 ${instanceName2}`).toString(),
      );
      console.log(
        "[Profile Created]",
        execSync(`sudo -E lxc profile create ${profileName}`).toString(),
      );
      console.log(
        "[Network Created]",
        execSync(`sudo -E lxc network create ${networkName}`).toString(),
      );
      console.log(
        "[Storage Pool Created]",
        execSync(`sudo -E lxc storage create ${poolName} dir`).toString(),
      );
      console.log(
        "[Custom Volume Created]",
        execSync(
          `sudo -E lxc storage volume create ${poolName} ${volumeName}`,
        ).toString(),
      );
      console.log(
        "[Custom ISO Imported]",
        execSync(
          `sudo -E lxc storage volume import ${poolName} ${ISO_FILE} ${customISOName}`,
        ).toString(),
      );
      console.log(
        "[ACL Created]",
        execSync(`sudo -E lxc network acl create ${aclName}`).toString(),
      );
      console.log(
        "[Add Network ACL Rule]",
        execSync(
          `sudo -E lxc network acl rule add ${aclName} ingress action=allow`,
        ).toString(),
      );
      console.log(
        "[Identity Trusted]",
        execSync(
          `sudo -E lxc auth identity create tls/${identityName}`,
        ).toString(),
      );
      console.log(
        "[Group Created]",
        execSync(`sudo -E lxc auth group create ${groupName}`).toString(),
      );
      console.log(
        "[IDP Group Created]",
        execSync(
          `sudo -E lxc auth identity-provider-group create ${idpGroupName}`,
        ).toString(),
      );
    } catch (err) {
      console.error("Error occurred:", err);
    }

    try {
      const fingerprint = execSync(
        "sudo -E lxc config trust list | grep lxd-ui.crt | awk '{print $8}'",
      ).toString();

      console.log(
        "[Remove current user]",
        execSync(`sudo -E lxc config trust remove ${fingerprint}`).toString(),
      );

      console.log(
        "[Create test-viewers group]",
        execSync(`sudo -E lxc auth group create test-viewers`).toString(),
      );

      console.log(
        "[Grant viewer entitlement to test-viewers group]",
        execSync(
          `sudo -E lxc auth group permission add test-viewers server viewer`,
        ).toString(),
      );

      console.log(
        "[Add new user to test-viewers group] - ",
        execSync(
          `sudo -E lxc auth identity create tls/lxd-ui --group test-viewers keys/lxd-ui.crt`,
        ).toString(),
      );
    } catch (err) {
      console.error("Error occurred during setup:", err);
    }
  });

  test.afterAll(({ lxdVersion }) => {
    if (lxdVersion === "5.0-edge") {
      return;
    }

    try {
      console.log(
        "[Instance 1 Deleted]",
        execSync(`sudo -E lxc delete ${instanceName1} --force`).toString(),
      );
      console.log(
        "[Instance 2 Deleted]",
        execSync(`sudo -E lxc delete ${instanceName2} --force`).toString(),
      );
      console.log(
        "[Profile Deleted]",
        execSync(`sudo -E lxc profile delete ${profileName}`).toString(),
      );
      console.log(
        "[Network Deleted]",
        execSync(`sudo -E lxc network delete ${networkName}`).toString(),
      );
      console.log(
        "[Storage Volume Deleted]",
        execSync(
          `sudo -E lxc storage volume delete ${poolName} ${volumeName}`,
        ).toString(),
      );
      console.log(
        "[Custom ISO Volume Deleted]",
        execSync(
          `sudo -E lxc storage volume delete ${poolName} ${customISOName}`,
        ).toString(),
      );
      console.log(
        "[Storage Pool Deleted]",
        execSync(`sudo -E lxc storage delete ${poolName}`).toString(),
      );
      console.log(
        "[ACL Deleted]",
        execSync(`sudo -E lxc network acl delete ${aclName}`).toString(),
      );
      console.log(
        "[Identity Untrusted]",
        execSync(
          `sudo -E lxc auth identity delete tls/${identityName}`,
        ).toString(),
      );
      console.log(
        "[Group Deleted]",
        execSync(`sudo -E lxc auth group delete ${groupName}`).toString(),
      );
      console.log(
        "[IDP Group Deleted]",
        execSync(
          `sudo -E lxc auth identity-provider-group delete ${idpGroupName}`,
        ).toString(),
      );
    } catch (err) {
      console.error("Cleanup error:", err);
    }

    try {
      console.log(
        "[Delete restricted user]",
        execSync(`sudo -E lxc auth identity delete tls/lxd-ui`).toString(),
      );

      console.log(
        "[Delete test-viewers group]",
        execSync(`sudo -E lxc auth group delete test-viewers`).toString(),
      );

      console.log(
        "[Reinstate admin user]",
        execSync("sudo -E lxc config trust add keys/lxd-ui.crt").toString(),
      );
    } catch (err) {
      console.error("Error occurred during afterAll cleanup:", err);
    }
  });

  test("Cannot interact with Instances", async ({ page, lxdVersion }) => {
    test.skip(
      lxdVersion === "5.0-edge",
      "Lxd v5.0/edge does not support fine-grained permissions",
    );

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
    await selectAllInstances(page);
    await expect(
      page.getByTitle(
        "You do not have permission to start the selected instances",
      ),
    ).toBeDisabled();
    await expect(
      page.getByTitle(
        "You do not have permission to restart the selected instances",
      ),
    ).toBeDisabled();
    await expect(
      page.getByTitle(
        "You do not have permission to freeze the selected instances",
      ),
    ).toBeDisabled();
    await expect(
      page.getByTitle(
        "You do not have permission to stop the selected instances",
      ),
    ).toBeDisabled();
    await expect(
      page.getByTitle(
        "You do not have permission to delete the selected instances",
      ),
    ).toBeDisabled();
    await page.reload();

    // Cannot start, restart, pause or stop instances from the instance list page on hover.
    await page.getByPlaceholder("Search").click();
    await page.getByPlaceholder("Search").fill(instanceName1);
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    await page
      .locator("#instances-table")
      .getByRole("rowheader", { name: `Select ${instanceName1}` })
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
    await openInstancePanel(page, instanceName1);
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
    await visitInstance(page, instanceName1);
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

  test("Cannot interact with Profiles", async ({ page, lxdVersion }) => {
    test.skip(
      lxdVersion === "5.0-edge",
      "Lxd v5.0/edge does not support fine-grained permissions",
    );

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

  test("Cannot interact with Networks", async ({ page, lxdVersion }) => {
    test.skip(
      lxdVersion === "5.0-edge",
      "Lxd v5.0/edge does not support fine-grained permissions",
    );

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

  test("Cannot interact with Storage", async ({ page, lxdVersion }) => {
    test.skip(
      lxdVersion === "5.0-edge",
      "Lxd v5.0/edge does not support fine-grained permissions",
    );

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

  test("Cannot interact with Images", async ({ page, lxdVersion }) => {
    test.skip(
      lxdVersion === "5.0-edge",
      "Lxd v5.0/edge does not support fine-grained permissions",
    );

    await gotoURL(page, "/ui/");
    await page.getByText("Images", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Upload image" }),
    ).toBeDisabled();
  });

  test("Cannot interact with the Project", async ({ page, lxdVersion }) => {
    test.skip(
      lxdVersion === "5.0-edge",
      "Lxd v5.0/edge does not support fine-grained permissions",
    );

    await gotoURL(page, "/ui/");
    await page.getByRole("button", { name: "default" }).click();
    await expect(
      page.getByRole("button", { name: "Create project" }),
    ).toBeDisabled();
    await page.keyboard.press("Escape");

    await page.getByText("Configuration", { exact: true }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByLabel("Description")).toBeDisabled();
  });

  test("Cannot interact with Server settings", async ({ page, lxdVersion }) => {
    test.skip(
      lxdVersion === "5.0-edge",
      "Lxd v5.0/edge does not support fine-grained permissions",
    );

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

  test("Cannot interact with Identities", async ({ page, lxdVersion }) => {
    test.skip(
      lxdVersion === "5.0-edge",
      "Lxd v5.0/edge does not support fine-grained permissions",
    );

    await gotoURL(page, "/ui/");
    await page.getByText("Permissions", { exact: true }).click();
    await page.getByText("Identities", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Create TLS identity" }),
    ).toBeDisabled();

    await page.getByPlaceholder("Filter").click();
    await page.getByPlaceholder("Filter").fill(identityName);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);
    await expect(page.getByLabel("Manage groups").first()).toBeDisabled();
    await expect(page.getByLabel("Delete identity").first()).toBeDisabled();
  });

  test("Cannot interact with Groups", async ({ page, lxdVersion }) => {
    test.skip(
      lxdVersion === "5.0-edge",
      "Lxd v5.0/edge does not support fine-grained permissions",
    );

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
