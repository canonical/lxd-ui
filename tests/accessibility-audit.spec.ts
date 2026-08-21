import { test } from "./fixtures/lxd-test";
import {
  runA11yAudit,
  runA11yAuditForModal,
  runA11yAuditForPanel,
  skipIfNotA11yProject,
} from "./helpers/a11y";
import { getFirstClusterMember } from "./helpers/cluster";
import {
  createImageRegistry,
  deleteImageRegistry,
  randomImageRegistryName,
  visitImageRegistry,
} from "./helpers/image-registries";
import {
  createInstance,
  deleteInstance,
  randomInstanceName,
  visitInstance,
} from "./helpers/instances";
import { openInstancePanel } from "./helpers/instancePanel";
import { clickSideNavItem, closePanel, gotoURL } from "./helpers/navigate";
import {
  createNetwork,
  deleteNetwork,
  randomNetworkName,
  visitNetwork,
} from "./helpers/network";
import {
  createVolume,
  deleteVolume,
  randomVolumeName,
  visitVolume,
} from "./helpers/storageVolume";
import { visitPool } from "./helpers/storagePool";
import { visitProfile } from "./helpers/profile";
import {
  createProject,
  deleteProject,
  openProjectConfiguration,
  randomProjectName,
} from "./helpers/projects";
import {
  createIdentity,
  deleteIdentity,
  randomIdentityName,
} from "./helpers/permission-identities";
import {
  createGroup,
  deleteGroup,
  randomGroupName,
} from "./helpers/permission-groups";
import {
  createIdpGroup,
  deleteIdpGroup,
  randomIdpGroupName,
  visitIdpGroups,
} from "./helpers/permission-idp-groups";

test.describe("instances", () => {
  const instance = randomInstanceName();

  test.beforeAll(async ({ browser }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    const page = await browser.newPage();
    await createInstance(page, instance);
    await page.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    const page = await browser.newPage();
    await deleteInstance(page, instance);
    await page.close();
  });

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(({}, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
  });

  test("list page", async ({ page }) => {
    await clickSideNavItem(page, "Instances");
    await runA11yAudit(page, test.info());
  });

  test("detail page", async ({ page }) => {
    await visitInstance(page, instance);
    await runA11yAudit(page, test.info());
  });

  test("summary panel", async ({ page }) => {
    await openInstancePanel(page, instance);
    await runA11yAuditForPanel(page, test.info());
  });

  test("create page", async ({ page }) => {
    await clickSideNavItem(page, "Instances");
    await page.getByRole("button", { name: "Create instance" }).click();
    await runA11yAudit(page, test.info());
  });

  test("migrate modal", async ({ page }) => {
    await visitInstance(page, instance);
    await page.getByRole("button", { name: "Migrate" }).click();
    await runA11yAuditForModal(page, test.info());
  });

  test("migrate instance - root storage pool select", async ({ page }) => {
    await visitInstance(page, instance);
    await page.getByRole("button", { name: "Migrate" }).click();

    await page
      .getByRole("button", { name: "Move instance root storage" })
      .click();
    await runA11yAuditForModal(page, test.info());
  });

  test("migrate instance - root storage pool confirm", async ({ page }) => {
    await visitInstance(page, instance);
    await page.getByRole("button", { name: "Migrate" }).click();

    await page
      .getByRole("button", { name: "Move instance root storage" })
      .click();

    await page
      .getByRole("row")
      .getByRole("button", { name: "Select" })
      .and(page.locator(":not([aria-disabled='true'])"))
      .first()
      .click();
    await runA11yAuditForModal(page, test.info());
  });

  test("migrate instance - project select", async ({ page }) => {
    await visitInstance(page, instance);
    await page.getByRole("button", { name: "Migrate" }).click();

    await page
      .getByRole("button", { name: "Move instance to a different project" })
      .click();
    await runA11yAuditForModal(page, test.info());
  });

  test("migrate instance - project confirm", async ({ page }) => {
    await visitInstance(page, instance);
    await page.getByRole("button", { name: "Migrate" }).click();

    await page
      .getByRole("button", { name: "Move instance to a different project" })
      .click();

    await page
      .getByRole("row")
      .getByRole("button", { name: "Select" })
      .and(page.locator(":not([aria-disabled='true'])"))
      .first()
      .click();
    await runA11yAuditForModal(page, test.info());
  });

  test("migrate instance - cluster member select", async ({ page }) => {
    await visitInstance(page, instance);
    await page.getByRole("button", { name: "Migrate" }).click();

    const clusterButton = page.getByRole("button", {
      name: "Migrate instance to a different cluster member",
    });
    test.skip(
      !(await clusterButton.isVisible()),
      "Not a clustered environment",
    );

    await clusterButton.click();
    await runA11yAuditForModal(page, test.info());
  });

  test("migrate instance - cluster member confirm", async ({ page }) => {
    await visitInstance(page, instance);
    await page.getByRole("button", { name: "Migrate" }).click();

    const clusterButton = page.getByRole("button", {
      name: "Migrate instance to a different cluster member",
    });
    test.skip(
      !(await clusterButton.isVisible()),
      "Not a clustered environment",
    );

    await clusterButton.click();

    await page
      .getByRole("row")
      .getByRole("button", { name: "Select" })
      .and(page.locator(":not([aria-disabled='true'])"))
      .first()
      .click();
    await runA11yAuditForModal(page, test.info());
  });

  test("export modal", async ({ page }) => {
    await visitInstance(page, instance);
    await page.getByRole("button", { name: "Export" }).click();
    await runA11yAuditForModal(page, test.info());
  });

  test("configure snapshot modal", async ({ page }) => {
    await visitInstance(page, instance);
    await page.getByTestId("tab-link-Snapshots").click();
    await page.getByRole("button", { name: "See configuration" }).click();
    await runA11yAuditForModal(page, test.info());
  });
});

test.describe("profiles", () => {
  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(({}, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
  });

  test("list page", async ({ page }) => {
    await clickSideNavItem(page, "Profiles");
    await runA11yAudit(page, test.info());
  });

  test("detail page", async ({ page }) => {
    await visitProfile(page, "default");
    await runA11yAudit(page, test.info());
  });

  test("create page", async ({ page }) => {
    await clickSideNavItem(page, "Profiles");
    await page.getByRole("button", { name: "Create profile" }).click();
    await runA11yAudit(page, test.info());
  });
});

test.describe("networks", () => {
  const network = randomNetworkName();

  test.beforeAll(async ({ browser }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    const page = await browser.newPage();
    await createNetwork(page, network);
    await page.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    const page = await browser.newPage();
    await deleteNetwork(page, network);
    await page.close();
  });

  test("networks page", async ({ page }) => {
    await clickSideNavItem(page, "Networks", "Networking");
    await runA11yAudit(page, test.info());
  });

  test("detail page", async ({ page }) => {
    await visitNetwork(page, network);
    await runA11yAudit(page, test.info());
  });

  test("ACLs page", async ({ page }) => {
    await clickSideNavItem(page, "ACLs", "Networking");
    await runA11yAudit(page, test.info());
  });

  test("IPAM page", async ({ page }) => {
    await clickSideNavItem(page, "IPAM", "Networking");
    await runA11yAudit(page, test.info());
  });

  test("create network page", async ({ page }) => {
    await clickSideNavItem(page, "Networks", "Networking");
    await page.getByRole("button", { name: "Create network" }).click();
    await runA11yAudit(page, test.info());
  });

  test("create network ACL page", async ({ page }) => {
    await clickSideNavItem(page, "ACLs", "Networking");
    await page.getByRole("button", { name: "Create ACL" }).click();
    await runA11yAudit(page, test.info());
  });
});

test.describe("storage", () => {
  const volume = randomVolumeName();

  test.beforeAll(async ({ browser }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    const page = await browser.newPage();
    await createVolume(page, volume);
    await page.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    const page = await browser.newPage();
    await deleteVolume(page, volume);
    await page.close();
  });

  test("pools page", async ({ page }) => {
    await clickSideNavItem(page, "Pools", "Storage");
    await runA11yAudit(page, test.info());
  });

  test("pool detail page", async ({ page }) => {
    await visitPool(page, "default");
    await runA11yAudit(page, test.info());
  });

  test("volumes page", async ({ page }) => {
    await clickSideNavItem(page, "Volumes", "Storage");
    await runA11yAudit(page, test.info());
  });

  test("volume detail page", async ({ page }) => {
    await visitVolume(page, volume);
    await runA11yAudit(page, test.info());
  });

  test("buckets page", async ({ page }) => {
    await clickSideNavItem(page, "Buckets", "Storage");
    await runA11yAudit(page, test.info());
  });

  test("custom ISOs page", async ({ page }) => {
    await clickSideNavItem(page, "Custom ISOs", "Storage");
    await runA11yAudit(page, test.info());
  });

  test("create storage bucket panel", async ({ page }) => {
    await clickSideNavItem(page, "Buckets", "Storage");
    await page.getByRole("button", { name: "Create bucket" }).click();
    await runA11yAuditForPanel(page, test.info());
    await closePanel(page);
  });

  test("create storage pool page", async ({ page }) => {
    await clickSideNavItem(page, "Pools", "Storage");
    await page.getByRole("button", { name: "Create pool" }).click();
    await runA11yAudit(page, test.info());
  });

  test("create storage volume page", async ({ page }) => {
    await clickSideNavItem(page, "Volumes", "Storage");
    await page.getByRole("button", { name: "Create volume" }).click();
    await runA11yAudit(page, test.info());
  });

  test("custom ISO upload modal", async ({ page }) => {
    await clickSideNavItem(page, "Custom ISOs", "Storage");
    await page.getByRole("button", { name: "Upload custom ISO" }).click();
    await runA11yAuditForModal(page, test.info());
  });

  test("migrate volume modal", async ({ page }) => {
    await visitVolume(page, volume);
    await page.getByRole("button", { name: "Migrate", exact: true }).click();
    await runA11yAuditForModal(page, test.info());
  });

  test("migrate volume - storage pool select", async ({ page }) => {
    await visitVolume(page, volume);
    await page.getByRole("button", { name: "Migrate", exact: true }).click();

    await page
      .getByRole("button", { name: "Move volume to a different storage pool" })
      .click();
    await runA11yAuditForModal(page, test.info());
  });

  test("migrate volume - storage pool confirm", async ({ page }) => {
    await visitVolume(page, volume);
    await page.getByRole("button", { name: "Migrate", exact: true }).click();

    await page
      .getByRole("button", { name: "Move volume to a different storage pool" })
      .click();

    await page
      .getByRole("row")
      .getByRole("button", { name: "Select" })
      .and(page.locator(":not([aria-disabled='true'])"))
      .first()
      .click();
    await runA11yAuditForModal(page, test.info());
  });

  test("migrate volume - project select", async ({ page }) => {
    await visitVolume(page, volume);
    await page.getByRole("button", { name: "Migrate", exact: true }).click();

    await page
      .getByRole("button", { name: "Move volume to a different project" })
      .click();
    await runA11yAuditForModal(page, test.info());
  });

  test("migrate volume - project confirm", async ({ page }) => {
    await visitVolume(page, volume);
    await page.getByRole("button", { name: "Migrate", exact: true }).click();

    await page
      .getByRole("button", { name: "Move volume to a different project" })
      .click();

    await page
      .getByRole("row")
      .getByRole("button", { name: "Select" })
      .and(page.locator(":not([aria-disabled='true'])"))
      .first()
      .click();
    await runA11yAuditForModal(page, test.info());
  });

  test("migrate volume - cluster member select", async ({ page }) => {
    await visitVolume(page, volume);
    await page.getByRole("button", { name: "Migrate", exact: true }).click();

    const clusterButton = page.getByRole("button", {
      name: "Migrate volume to a different cluster member",
    });
    test.skip(
      !(await clusterButton.isVisible()),
      "Not a clustered environment",
    );

    await clusterButton.click();
    await runA11yAuditForModal(page, test.info());
  });

  test("migrate volume - cluster member confirm", async ({ page }) => {
    await visitVolume(page, volume);
    await page.getByRole("button", { name: "Migrate", exact: true }).click();

    const clusterButton = page.getByRole("button", {
      name: "Migrate volume to a different cluster member",
    });
    test.skip(
      !(await clusterButton.isVisible()),
      "Not a clustered environment",
    );

    await clusterButton.click();

    await page
      .getByRole("row")
      .getByRole("button", { name: "Select" })
      .and(page.locator(":not([aria-disabled='true'])"))
      .first()
      .click();
    await runA11yAuditForModal(page, test.info());
  });
});

test.describe("images", () => {
  const imageRegistry = randomImageRegistryName();

  test.beforeAll(async ({ browser }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    const page = await browser.newPage();
    await createImageRegistry(page, imageRegistry, "SimpleStreams", {
      url: "https://images.linuxcontainers.org",
    });
    await page.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    const page = await browser.newPage();
    await deleteImageRegistry(page, imageRegistry);
    await page.close();
  });

  test("list page", async ({ page }) => {
    await clickSideNavItem(page, "Local images", "Images");
    await runA11yAudit(page, test.info());
  });

  test("image registry detail page", async ({ page }) => {
    await visitImageRegistry(page, imageRegistry);
    await runA11yAudit(page, test.info());
  });
});

test.describe("projects", () => {
  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(({}, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
  });

  test("configuration page", async ({ page }) => {
    await clickSideNavItem(page, "Configuration");
    await runA11yAudit(page, test.info());
  });

  test("create page", async ({ page }) => {
    await gotoURL(page, "/ui/");
    await page.getByRole("button", { name: "default" }).waitFor();
    await page.getByRole("button", { name: "default" }).click();
    await page.getByRole("button", { name: "Create project" }).click();
    await page.getByRole("heading", { name: "Create a project" }).waitFor();
    await runA11yAudit(page, test.info());
  });

  test("delete modal", async ({ page }) => {
    const project = randomProjectName();
    await createProject(page, project);

    await gotoURL(page, "/ui/");
    await page.getByRole("button", { name: "default" }).waitFor();
    await page.getByRole("button", { name: "default" }).click();
    await page.getByRole("link", { name: project }).click();
    await page.getByRole("button", { name: project }).waitFor();
    await openProjectConfiguration(page);
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("dialog", { name: "Confirm delete" }).waitFor();

    await runA11yAuditForModal(page, test.info());
    await deleteProject(page, project);
  });
});

test.describe("clustering", () => {
  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(({}, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
  });

  test("server page", async ({ page }) => {
    await clickSideNavItem(page, "Server", "Clustering");
    await runA11yAudit(page, test.info());
  });

  test("cluster member detail page", async ({ page }) => {
    const membersLink = page.getByRole("link", { name: "Members" });
    await clickSideNavItem(page, "Server", "Clustering");
    const hasMembersLink = await membersLink.isVisible();
    test.skip(!hasMembersLink, "Not a clustered environment");

    const member = await getFirstClusterMember(page);
    await gotoURL(page, `/ui/cluster/member/${member}`);
    await page.waitForLoadState("networkidle");
    await runA11yAudit(page, test.info());
  });

  test("cluster groups page", async ({ page }) => {
    await clickSideNavItem(page, "Groups", "Clustering");
    await runA11yAudit(page, test.info());
  });

  test("placement groups page", async ({ page }) => {
    await clickSideNavItem(page, "Placement", "Clustering");
    await runA11yAudit(page, test.info());
  });

  test("cluster links page", async ({ page }) => {
    await clickSideNavItem(page, "Links", "Clustering");
    await runA11yAudit(page, test.info());
  });

  test("replicators page", async ({ page }) => {
    await clickSideNavItem(page, "Replicators", "Clustering");
    await runA11yAudit(page, test.info());
  });

  test("create cluster link direction panel", async ({ page }) => {
    await clickSideNavItem(page, "Links", "Clustering");
    await page.getByRole("button", { name: "Create cluster link" }).click();
    await runA11yAuditForPanel(page, test.info());
    await closePanel(page);
  });

  test("create cluster link details panel", async ({ page }) => {
    await clickSideNavItem(page, "Links", "Clustering");
    await page.getByRole("button", { name: "Create cluster link" }).click();
    await page.getByRole("button", { name: "Bidirectional" }).click();
    await runA11yAuditForPanel(page, test.info());
    await page.getByRole("button", { name: "Back" }).click();
    await closePanel(page);
  });

  test("create replicator panel", async ({ page }) => {
    await clickSideNavItem(page, "Replicators", "Clustering");
    await page.getByRole("button", { name: "Create replicator" }).click();
    await runA11yAuditForPanel(page, test.info());
    await closePanel(page);
  });
});

test.describe("operations", () => {
  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(({}, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
  });

  test("list page", async ({ page }) => {
    await clickSideNavItem(page, "Operations");
    await runA11yAudit(page, test.info());
  });
});

test.describe("warnings", () => {
  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(({}, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
  });

  test("list page", async ({ page }) => {
    await clickSideNavItem(page, "Warnings");
    await runA11yAudit(page, test.info());
  });
});

test.describe("permissions", () => {
  const identity = randomIdentityName();
  const group = randomGroupName();
  const idpGroup = randomIdpGroupName();

  test.beforeAll(async ({ browser }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    const page = await browser.newPage();
    await createGroup(page, group, "a11y test group");
    await createIdentity(page, identity, "Client certificate");
    await createIdpGroup(page, idpGroup, [group]);
    await page.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    const page = await browser.newPage();
    await visitIdpGroups(page);
    await deleteIdpGroup(page, idpGroup);
    await deleteIdentity(page, identity);
    await deleteGroup(page, group);
    await page.close();
  });

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(({}, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
  });

  test("identities page", async ({ page }) => {
    await clickSideNavItem(page, "Identities", "Permissions");
    await runA11yAudit(page, test.info());
  });

  test("groups page", async ({ page }) => {
    await clickSideNavItem(page, "Groups", "Permissions");
    await runA11yAudit(page, test.info());
  });

  test("IDP groups page", async ({ page }) => {
    await clickSideNavItem(page, "IDP groups", "Permissions");
    await runA11yAudit(page, test.info());
  });

  test("create identity type selection panel", async ({ page }) => {
    await clickSideNavItem(page, "Identities", "Permissions");
    await page.getByRole("button", { name: "Create identity" }).click();
    await runA11yAuditForPanel(page, test.info());
    await closePanel(page);
  });

  test("create identity details panel", async ({ page }) => {
    await clickSideNavItem(page, "Identities", "Permissions");
    await page.getByRole("button", { name: "Create identity" }).click();
    await page.getByRole("button", { name: "Client certificate" }).click();
    await runA11yAuditForPanel(page, test.info());
    await page.getByRole("button", { name: "Back" }).click();
    await closePanel(page);
  });

  test("edit identity panel", async ({ page }) => {
    await clickSideNavItem(page, "Identities", "Permissions");
    await page.getByRole("button", { name: "Edit identity" }).first().click();
    await runA11yAuditForPanel(page, test.info());
    await closePanel(page);
  });

  test("create group panel", async ({ page }) => {
    await clickSideNavItem(page, "Groups", "Permissions");
    await page.getByRole("button", { name: "Create group" }).click();
    await runA11yAuditForPanel(page, test.info());
    await closePanel(page);
  });

  test("edit group panel", async ({ page }) => {
    await clickSideNavItem(page, "Groups", "Permissions");
    await page.getByRole("button", { name: "Edit group" }).first().click();
    await runA11yAuditForPanel(page, test.info());
    await closePanel(page);
  });

  test("create IDP group panel", async ({ page }) => {
    await clickSideNavItem(page, "IDP groups", "Permissions");
    await page.getByRole("button", { name: "Create IDP group" }).click();
    await runA11yAuditForPanel(page, test.info());
    await closePanel(page);
  });

  test("edit IDP group panel", async ({ page }) => {
    await clickSideNavItem(page, "IDP groups", "Permissions");
    await page
      .getByRole("button", { name: "Edit IDP group details" })
      .first()
      .click();
    await runA11yAuditForPanel(page, test.info());
    await closePanel(page);
  });
});

test.describe("settings", () => {
  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(({}, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
  });

  test("list page", async ({ page }) => {
    await clickSideNavItem(page, "Settings");
    await runA11yAudit(page, test.info());
  });
});
