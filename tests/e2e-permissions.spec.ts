import { test, expect } from "./fixtures/lxd-test";
import { visitInstance } from "./helpers/instances";
import { gotoURL } from "./helpers/navigate";
import { execSync } from "child_process";

test.beforeEach(() => {
  test.skip(
    Boolean(process.env.CI),
    "This suite is only run manually to create screenshots for the documentation",
  );
});

test.describe("Given a user with Viewer Server permissions...", () => {
  const instanceName = "test-instance";
  const profileName = "test-profile";
  const networkName = "test-network";
  const poolName = "test-pool";
  const volumeName = "test-volume";
  //   const customISOName = "test-custom-iso"; // Need ISO file
  //   const bucketName = "test-bucket"; // Need CephObject
  const aclName = "test-acl";
  const identityName = "test-identity";
  const groupName = "test-group";
  test.beforeAll(async ({}) => {
    try {
      execSync(`lxc init ubuntu:24.04 ${instanceName}`);
      console.log("Instance created");

      execSync(`lxc profile create ${profileName}`);
      console.log("Profile created");

      execSync(`lxc network create ${networkName}`);
      console.log("Network created");

      execSync(`lxc storage create ${poolName} dir`);
      console.log("Storage pool created");

      execSync(`lxc storage volume create ${poolName} ${volumeName}`);
      console.log("Custom volume created");

      // execSync(`lxc storage volume import ${poolName} /tmp/${customISOName}.iso ${customISOName} --type iso`);
      // console.log("Custom ISO imported");

      // execSync(`lxc bucket create ${bucketName}`);
      // console.log("Bucket created");

      execSync(`lxc network acl create ${aclName}`);
      console.log("ACL created");

      execSync(`lxc auth identity create tls/${identityName}`);
      console.log("Identity trusted");

      execSync(`lxc auth group create ${groupName}`);
      console.log("Group created");
    } catch (err) {
      console.error("Error occurred:", err);
    }
  });

  test.afterAll(async ({}) => {
    try {
      execSync(`lxc delete ${instanceName} --force`);
      console.log("Instance deleted");

      execSync(`lxc profile delete ${profileName}`);
      console.log("Profile deleted");

      execSync(`lxc network delete ${networkName}`);
      console.log("Network deleted");

      execSync(`lxc storage volume delete ${poolName} ${volumeName}`);
      console.log("Storage volume deleted");

      execSync(`lxc storage delete ${poolName}`);
      console.log("Storage pool deleted");

      // execSync(`lxc storage volume delete ${poolName} ${customISOName}`);
      // console.log("Custom ISO volume deleted");

      // execSync(`lxc storage bucket delete ${poolName} ${bucketName}`);
      // console.log("Bucket deleted");

      execSync(`lxc network acl delete ${aclName}`);
      console.log("ACL deleted");

      execSync(`lxc config trust revoke-token ${identityName}`);
      console.log("Identity untrusted");

      execSync(`lxc auth group delete ${groupName}`);
      console.log("Group deleted");
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  });

  test("Cannot interact with instances", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByText("Instances", { exact: true }).click();

    await expect(
      page.getByRole("button", { name: "Create instance" }),
    ).toBeDisabled();
    const title = await page
      .getByRole("button", { name: "Create instance" })
      .getAttribute("title");
    expect(title).toContain("You do not have permission to create instances");

    //Cannot start, restart, pause or stop instances
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
  });

  test("Cannot interact with Profiles", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByText("Profiles", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Create profile" }),
    ).toBeDisabled();
  });

  test("Cannot interact with Networks", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByText("Networking", { exact: true }).click();
    await page.getByText("Networks", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Create network" }),
    ).toBeDisabled();

    await page.getByText("ACLs", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Create ACL" }),
    ).toBeDisabled();
  });

  test("Cannot interact with Storage", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByText("Storage", { exact: true }).click();
    await page.getByText("Pools", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Create pool" }),
    ).toBeDisabled();

    await page.getByText("Volumes", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Create volume" }),
    ).toBeDisabled();

    await page.getByText("Custom ISOs", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Upload custom ISO" }),
    ).toBeDisabled();

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

  test("Cannot interact with Server settings", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByText("Server", { exact: true }).click();
    await expect(page.getByRole("button", { name: "Edit" })).not.toBeVisible();
  });

  test("Cannot interact with Identities", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByText("Permissions", { exact: true }).click();
    await page.getByText("Identities", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Create TLS identity" }),
    ).toBeDisabled();
  });

  test("Cannot interact with Groups", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByText("Permissions", { exact: true }).click();
    await page.getByText("Groups", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Create group" }),
    ).toBeDisabled();
  });
});
