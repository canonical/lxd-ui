import { test, expect } from "./fixtures/lxd-test";
import { skipIfNotClustered, skipIfNotSupported } from "./helpers/cluster";
import {
  createNetwork,
  deleteNetwork,
  getNetworkLink,
  randomNetworkName,
  visitNetwork,
} from "./helpers/network";
import {
  attachNetworkAclsToNetwork,
  createNetworkAcl,
  deleteNetworkAcl,
  detachNetworkAclsFromNetwork,
  editNetworkAcl,
  randomNetworkAclName,
  renameNetworkAcl,
  selectNetworkAcls,
  setAclDefaults,
} from "./helpers/network-acls";
import {
  deleteProfile,
  finishProfileCreation,
  randomProfileName,
  startProfileCreation,
  visitProfile,
} from "./helpers/profile";

test("create a network acl", async ({ page }) => {
  const networkAcl = randomNetworkAclName();
  const newName = randomNetworkAclName();
  await createNetworkAcl(page, networkAcl);
  await editNetworkAcl(page, networkAcl);
  await renameNetworkAcl(page, networkAcl, newName);
  await deleteNetworkAcl(page, newName);
});

test.describe("apply ACLs", () => {
  const acl = randomNetworkAclName();
  const acl2 = randomNetworkAclName();
  const network = randomNetworkName();

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await createNetworkAcl(page, acl);
    await createNetworkAcl(page, acl2);
    await createNetwork(page, network);
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await deleteNetwork(page, network);
    await deleteNetworkAcl(page, acl);
    await deleteNetworkAcl(page, acl2);
    await page.close();
  });

  test("apply 2 ACLs to a network", async ({ page }) => {
    await attachNetworkAclsToNetwork(page, [acl, acl2], network);
    await setAclDefaults(page, "allow", "drop");

    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(5000);
    const networkLink = await getNetworkLink(page, network);
    await expect(networkLink).toBeVisible();
    await visitNetwork(page, network);

    const aclChip = page.locator(".p-chip", { hasText: acl });
    await expect(aclChip).toBeVisible();
    const aclChip2 = page.locator(".p-chip", { hasText: acl2 });
    await expect(aclChip2).toBeVisible();

    await expect(page.locator("text=Egress traffic is: allowed")).toBeVisible();
    await expect(
      page.locator("text=Ingress traffic is: dropped"),
    ).toBeVisible();

    await detachNetworkAclsFromNetwork(page, [acl, acl2], network);
    await expect(page.getByLabel("Egress traffic")).toBeDisabled();
    await expect(page.getByLabel("Ingress traffic")).toBeDisabled();

    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(5000);
    await visitNetwork(page, network);

    await expect(aclChip).not.toBeVisible();
    await expect(aclChip2).not.toBeVisible();
    await expect(page.getByLabel("Egress traffic")).not.toBeVisible();
    await expect(page.getByLabel("Ingress traffic")).not.toBeVisible();
  });

  test("attach network with ACLs to a profile", async ({ page }) => {
    await attachNetworkAclsToNetwork(page, [acl, acl2], network);
    await setAclDefaults(page, "reject", "allow");

    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(5000);

    const profile = randomProfileName();
    await startProfileCreation(page, profile);
    await page.getByText("Network", { exact: true }).click();
    await page.getByRole("button", { name: "Attach network" }).click();
    await expect(
      page.getByRole("heading", { name: "Create network device" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "* Network" }).click();
    await expect(page.getByText("NameTypeACLs")).toBeVisible();
    await page.getByLabel("sub").getByText(network).first().click();

    const aclList = page.getByLabel("ACLs");
    await expect(aclList).toContainText(`${acl}, ${acl2}`);
    await expect(aclList).toBeDisabled();

    await expect(
      page.getByText("Network must be of type OVN to customize ACLs."),
    ).toBeVisible();

    await expect(page.getByLabel("Egress traffic")).toBeDisabled();
    await expect(page.getByLabel("Egress traffic")).toHaveValue("reject");
    await expect(page.getByLabel("Ingress traffic")).toBeDisabled();
    await expect(page.getByLabel("Ingress traffic")).toHaveValue("allow");

    await page.getByRole("button", { name: "Apply changes" }).click();
    await finishProfileCreation(page, profile);

    await visitProfile(page, profile);
    await page.getByTestId("tab-link-Configuration").click();
    await page.getByText("Network", { exact: true }).click();

    const aclChip = page.locator(".p-chip", { hasText: acl });
    await expect(aclChip).toBeVisible();
    const aclChip2 = page.locator(".p-chip", { hasText: acl2 });
    await expect(aclChip2).toBeVisible();

    await expect(
      page.locator("text=Egress traffic is: rejected"),
    ).toBeVisible();
    await expect(
      page.locator("text=Ingress traffic is: allowed"),
    ).toBeVisible();

    await deleteProfile(page, profile);
  });

  test("attach network to a profile then add ACLs to the nic device", async ({
    page,
    lxdVersion,
  }, testInfo) => {
    skipIfNotSupported(lxdVersion);
    skipIfNotClustered(testInfo.project.name);

    const bridge = randomNetworkName();
    await createNetwork(page, bridge);

    const ovn = randomNetworkName();
    await createNetwork(page, ovn, "ovn");

    const profile = randomProfileName();
    await startProfileCreation(page, profile);
    await page.getByText("Network", { exact: true }).click();
    await page.getByRole("button", { name: "Attach network" }).click();

    await page.getByRole("button", { name: "* Network" }).click();
    await page.getByLabel("sub").getByText(bridge).first().click();

    const aclButton = page.getByLabel("ACLs");
    await expect(aclButton).toBeVisible();
    await expect(aclButton).toBeDisabled();
    await expect(
      page.getByText("Network must be of type OVN to customize ACLs."),
    ).toBeVisible();

    await expect(page.getByLabel("Egress traffic")).toBeDisabled();
    await expect(page.getByLabel("Ingress traffic")).toBeDisabled();

    await page.getByRole("button", { name: "* Network" }).click();
    await page.getByLabel("sub").getByText(ovn).first().click();
    await expect(aclButton).toBeEnabled();
    await expect(
      page.getByText("Network must be of type OVN to customize ACLs."),
    ).not.toBeVisible();
    await expect(page.getByLabel("Egress traffic")).toBeDisabled();
    await expect(page.getByLabel("Ingress traffic")).toBeDisabled();

    await page.getByLabel("ACLs").click();
    await selectNetworkAcls(page, [acl, acl2]);

    await setAclDefaults(page, "drop", "reject");

    await page.getByRole("button", { name: "Apply changes" }).click();
    await finishProfileCreation(page, profile);

    await visitProfile(page, profile);
    await page.getByTestId("tab-link-Configuration").click();
    await page.getByText("Network", { exact: true }).click();

    const aclChip = page.locator(".p-chip", { hasText: acl });
    await expect(aclChip).toBeVisible();
    const aclChip2 = page.locator(".p-chip", { hasText: acl2 });
    await expect(aclChip2).toBeVisible();

    await expect(page.locator("text=Egress traffic is: dropped")).toBeVisible();
    await expect(
      page.locator("text=Ingress traffic is: rejected"),
    ).toBeVisible();

    await deleteProfile(page, profile);
    await deleteNetwork(page, bridge);
    await deleteNetwork(page, ovn);
  });
});
