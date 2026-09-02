import { test } from "./fixtures/lxd-test";
import {
  isA11yProject,
  runA11yAudit,
  runA11yAuditForModal,
  runA11yAuditForPanel,
  skipIfNotA11yProject,
} from "./helpers/a11y";
import {
  getFirstClusterMember,
  skipIfNotClusteredEnvironment,
} from "./helpers/cluster";
import {
  createImageRegistry,
  deleteImageRegistry,
  randomImageRegistryName,
  skipIfImageRegistriesNotSupported,
  visitImageRegistries,
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
import {
  createPool,
  deletePool,
  randomPoolName,
  visitPool,
} from "./helpers/storagePool";
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
  const pool = randomPoolName();
  const project = randomProjectName();

  test.beforeAll(async ({ browser }, testInfo) => {
    if (!isA11yProject(testInfo.project.name)) {
      return;
    }
    const page = await browser.newPage();
    await createInstance(page, instance);
    await createPool(page, pool);
    await createProject(page, project);
    await page.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    if (!isA11yProject(testInfo.project.name)) {
      return;
    }
    const page = await browser.newPage();
    await deleteInstance(page, instance);
    await deletePool(page, pool);
    await deleteProject(page, project);
    await page.close();
  });

  test("list page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Instances");
    await runA11yAudit(page, testInfo);
  });

  test("detail page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await visitInstance(page, instance);
    await runA11yAudit(page, testInfo);
  });

  test("summary panel", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await openInstancePanel(page, instance);
    await runA11yAuditForPanel(page, testInfo);
  });

  test("create page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Instances");
    await page.getByRole("button", { name: "Create instance" }).click();
    await runA11yAudit(page, testInfo);
  });

  test("migrate modal", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await visitInstance(page, instance);
    await page.getByRole("button", { name: "Migrate" }).click();
    await runA11yAuditForModal(page, testInfo);
  });

  test("migrate instance - root storage pool select", async ({
    page,
  }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await visitInstance(page, instance);
    await page.getByRole("button", { name: "Migrate" }).click();

    await page
      .getByRole("button", { name: "Move instance root storage" })
      .click();
    await runA11yAuditForModal(page, testInfo);
  });

  test("migrate instance - root storage pool confirm", async ({
    page,
  }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
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
    await runA11yAuditForModal(page, testInfo);
  });

  test("migrate instance - project select", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await visitInstance(page, instance);
    await page.getByRole("button", { name: "Migrate" }).click();

    await page
      .getByRole("button", { name: "Move instance to a different project" })
      .click();
    await runA11yAuditForModal(page, testInfo);
  });

  test("migrate instance - project confirm", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
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
    await runA11yAuditForModal(page, testInfo);
  });

  test("migrate instance - cluster member select", async ({
    page,
  }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await skipIfNotClusteredEnvironment(page);
    await visitInstance(page, instance);
    await page.getByRole("button", { name: "Migrate" }).click();

    await page
      .getByRole("button", {
        name: "Migrate instance to a different cluster member",
      })
      .click();
    await runA11yAuditForModal(page, testInfo);
  });

  test("migrate instance - cluster member confirm", async ({
    page,
  }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await skipIfNotClusteredEnvironment(page);
    await visitInstance(page, instance);
    await page.getByRole("button", { name: "Migrate" }).click();

    await page
      .getByRole("button", {
        name: "Migrate instance to a different cluster member",
      })
      .click();

    await page
      .getByRole("row")
      .getByRole("button", { name: "Select" })
      .and(page.locator(":not([aria-disabled='true'])"))
      .first()
      .click();
    await runA11yAuditForModal(page, testInfo);
  });

  test("export modal", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await visitInstance(page, instance);
    await page.getByRole("button", { name: "Export" }).click();
    await runA11yAuditForModal(page, testInfo);
  });

  test("configure snapshot modal", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await visitInstance(page, instance);
    await page.getByTestId("tab-link-Snapshots").click();
    await page.getByRole("button", { name: "See configuration" }).click();
    await runA11yAuditForModal(page, testInfo);
  });
});

test.describe("profiles", () => {
  test("list page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Profiles");
    await runA11yAudit(page, testInfo);
  });

  test("detail page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await visitProfile(page, "default");
    await runA11yAudit(page, testInfo);
  });

  test("create page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Profiles");
    await page.getByRole("button", { name: "Create profile" }).click();
    await runA11yAudit(page, testInfo);
  });
});

test.describe("networks", () => {
  const network = randomNetworkName();

  test.beforeAll(async ({ browser }, testInfo) => {
    if (!isA11yProject(testInfo.project.name)) {
      return;
    }
    const page = await browser.newPage();
    await createNetwork(page, network);
    await page.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    if (!isA11yProject(testInfo.project.name)) {
      return;
    }
    const page = await browser.newPage();
    await deleteNetwork(page, network);
    await page.close();
  });

  test("networks page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Networks", "Networking");
    await runA11yAudit(page, testInfo);
  });

  test("detail page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await visitNetwork(page, network);
    await runA11yAudit(page, testInfo);
  });

  test("ACLs page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "ACLs", "Networking");
    await runA11yAudit(page, testInfo);
  });

  test("IPAM page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "IPAM", "Networking");
    await runA11yAudit(page, testInfo);
  });

  test("create network page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Networks", "Networking");
    await page.getByRole("button", { name: "Create network" }).click();
    await runA11yAudit(page, testInfo);
  });

  test("create network ACL page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "ACLs", "Networking");
    await page.getByRole("button", { name: "Create ACL" }).click();
    await runA11yAudit(page, testInfo);
  });
});

test.describe("storage", () => {
  const volume = randomVolumeName();
  const pool = randomPoolName();
  const project = randomProjectName();

  test.beforeAll(async ({ browser }, testInfo) => {
    if (!isA11yProject(testInfo.project.name)) {
      return;
    }
    const page = await browser.newPage();
    await createPool(page, pool);
    await createVolume(page, volume);
    await createProject(page, project);
    await page.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    if (!isA11yProject(testInfo.project.name)) {
      return;
    }
    const page = await browser.newPage();
    await deleteVolume(page, volume);
    await deletePool(page, pool);
    await deleteProject(page, project);
    await page.close();
  });

  test("pools page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Pools", "Storage");
    await runA11yAudit(page, testInfo);
  });

  test("pool detail page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await visitPool(page, pool);
    await runA11yAudit(page, testInfo);
  });

  test("volumes page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Volumes", "Storage");
    await runA11yAudit(page, testInfo);
  });

  test("volume detail page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await visitVolume(page, volume);
    await runA11yAudit(page, testInfo);
  });

  test("buckets page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Buckets", "Storage");
    await runA11yAudit(page, testInfo);
  });

  test("custom ISOs page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Custom ISOs", "Storage");
    await runA11yAudit(page, testInfo);
  });

  test("create storage bucket panel", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Buckets", "Storage");
    await page.getByRole("button", { name: "Create bucket" }).click();
    await runA11yAuditForPanel(page, testInfo);
    await closePanel(page);
  });

  test("create storage pool page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Pools", "Storage");
    await page.getByRole("button", { name: "Create pool" }).click();
    await runA11yAudit(page, testInfo);
  });

  test("create storage volume page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Volumes", "Storage");
    await page.getByRole("button", { name: "Create volume" }).click();
    await runA11yAudit(page, testInfo);
  });

  test("custom ISO upload modal", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Custom ISOs", "Storage");
    await page.getByRole("button", { name: "Upload custom ISO" }).click();
    await runA11yAuditForModal(page, testInfo);
  });

  test("migrate volume modal", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await visitVolume(page, volume);
    await page.getByRole("button", { name: "Migrate", exact: true }).click();
    await runA11yAuditForModal(page, testInfo);
  });

  test("migrate volume - storage pool select", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await visitVolume(page, volume);
    await page.getByRole("button", { name: "Migrate", exact: true }).click();

    await page
      .getByRole("button", { name: "Move volume to a different storage pool" })
      .click();
    await runA11yAuditForModal(page, testInfo);
  });

  test("migrate volume - storage pool confirm", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
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
    await runA11yAuditForModal(page, testInfo);
  });

  test("migrate volume - project select", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await visitVolume(page, volume);
    await page.getByRole("button", { name: "Migrate", exact: true }).click();

    await page
      .getByRole("button", { name: "Move volume to a different project" })
      .click();
    await runA11yAuditForModal(page, testInfo);
  });

  test("migrate volume - project confirm", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
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
    await runA11yAuditForModal(page, testInfo);
  });

  test("migrate volume - cluster member select", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await skipIfNotClusteredEnvironment(page);
    await visitVolume(page, volume);
    await page.getByRole("button", { name: "Migrate", exact: true }).click();

    await page
      .getByRole("button", {
        name: "Migrate volume to a different cluster member",
      })
      .click();
    await runA11yAuditForModal(page, testInfo);
  });

  test("migrate volume - cluster member confirm", async ({
    page,
  }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await skipIfNotClusteredEnvironment(page);
    await visitVolume(page, volume);
    await page.getByRole("button", { name: "Migrate", exact: true }).click();

    await page
      .getByRole("button", {
        name: "Migrate volume to a different cluster member",
      })
      .click();

    await page
      .getByRole("row")
      .getByRole("button", { name: "Select" })
      .and(page.locator(":not([aria-disabled='true'])"))
      .first()
      .click();
    await runA11yAuditForModal(page, testInfo);
  });
});

test.describe("images", () => {
  test("list page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Local images", "Images");
    await runA11yAudit(page, testInfo);
  });

  test("image registry detail page", async ({ page, lxdVersion }, testInfo) => {
    const imageRegistry = randomImageRegistryName();
    skipIfNotA11yProject(testInfo.project.name);
    skipIfImageRegistriesNotSupported(lxdVersion);
    await createImageRegistry(page, imageRegistry, "SimpleStreams", {
      url: "https://images.linuxcontainers.org",
    });
    await visitImageRegistry(page, imageRegistry);
    await runA11yAudit(page, testInfo);
    await deleteImageRegistry(page, imageRegistry);
  });

  test("image registries list page", async ({ page, lxdVersion }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    skipIfImageRegistriesNotSupported(lxdVersion);
    await visitImageRegistries(page);
    await runA11yAudit(page, testInfo);
  });
});

test.describe("projects", () => {
  test("configuration page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Configuration");
    await runA11yAudit(page, testInfo);
  });

  test("create page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await gotoURL(page, "/ui/");
    await page.getByRole("button", { name: "default" }).waitFor();
    await page.getByRole("button", { name: "default" }).click();
    await page.getByRole("button", { name: "Create project" }).click();
    await page.getByRole("heading", { name: "Create a project" }).waitFor();
    await runA11yAudit(page, testInfo);
  });

  test("delete modal", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
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

    await runA11yAuditForModal(page, testInfo);
    await deleteProject(page, project);
  });
});

test.describe("clustering", () => {
  test("server page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Server", "Clustering");
    await runA11yAudit(page, testInfo);
  });

  test("members page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await skipIfNotClusteredEnvironment(page);
    await clickSideNavItem(page, "Members", "Clustering");
    await runA11yAudit(page, testInfo);
  });

  test("cluster member detail page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await skipIfNotClusteredEnvironment(page);
    const member = await getFirstClusterMember(page);
    await gotoURL(page, `/ui/cluster/member/${member}`);
    await page.waitForLoadState("networkidle");
    await runA11yAudit(page, testInfo);
  });

  test("cluster groups page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Cluster Groups", "Clustering");
    await runA11yAudit(page, testInfo);
  });

  test("placement groups page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Placement Groups", "Clustering");
    await runA11yAudit(page, testInfo);
  });

  test("cluster links page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Links", "Clustering");
    await runA11yAudit(page, testInfo);
  });

  test("replicators page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Replicators", "Clustering");
    await runA11yAudit(page, testInfo);
  });

  test("create cluster link direction panel", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Links", "Clustering");
    await page.getByRole("button", { name: "Create cluster link" }).click();
    await runA11yAuditForPanel(page, testInfo);
    await closePanel(page);
  });

  test("create cluster link bidirectional panel", async ({
    page,
  }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Links", "Clustering");
    await page.getByRole("button", { name: "Create cluster link" }).click();
    await page.getByRole("button", { name: "Bidirectional" }).click();
    await runA11yAuditForPanel(page, testInfo);
    await page.getByRole("button", { name: "Back" }).click();
    await closePanel(page);
  });

  test("create replicator panel", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await skipIfNotClusteredEnvironment(page);
    await clickSideNavItem(page, "Replicators", "Clustering");
    await page.getByRole("button", { name: "Create replicator" }).click();
    await runA11yAuditForPanel(page, testInfo);
    await closePanel(page);
  });
});

test.describe("operations", () => {
  test("list page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Operations");
    await runA11yAudit(page, testInfo);
  });
});

test.describe("warnings", () => {
  test("list page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Warnings");
    await runA11yAudit(page, testInfo);
  });
});

test.describe("permissions", () => {
  const identity = randomIdentityName();
  const group = randomGroupName();
  const idpGroup = randomIdpGroupName();

  test.beforeAll(async ({ browser }, testInfo) => {
    if (!isA11yProject(testInfo.project.name)) {
      return;
    }
    const page = await browser.newPage();
    await createGroup(page, group, "a11y test group");
    await createIdentity(page, identity, "Client certificate");
    await createIdpGroup(page, idpGroup, [group]);
    await page.close();
  });

  test.afterAll(async ({ browser }, testInfo) => {
    if (!isA11yProject(testInfo.project.name)) {
      return;
    }
    const page = await browser.newPage();
    await visitIdpGroups(page);
    await deleteIdpGroup(page, idpGroup);
    await deleteIdentity(page, identity);
    await deleteGroup(page, group);
    await page.close();
  });

  test("identities page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Identities", "Permissions");
    await runA11yAudit(page, testInfo);
  });

  test("auth groups page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Auth Groups", "Permissions");
    await runA11yAudit(page, testInfo);
  });

  test("IDP groups page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "IDP groups", "Permissions");
    await runA11yAudit(page, testInfo);
  });

  test("create identity type selection panel", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Identities", "Permissions");
    await page.getByRole("button", { name: "Create identity" }).click();
    await runA11yAuditForPanel(page, testInfo);
    await closePanel(page);
  });

  test("create identity certificate type panel", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Identities", "Permissions");
    await page.getByRole("button", { name: "Create identity" }).click();
    await page.getByRole("button", { name: "Client certificate" }).click();
    await runA11yAuditForPanel(page, testInfo);
    await page.getByRole("button", { name: "Back" }).click();
    await closePanel(page);
  });

  test("edit identity panel", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Identities", "Permissions");
    await page.getByRole("button", { name: "Edit identity" }).first().click();
    await runA11yAuditForPanel(page, testInfo);
    await closePanel(page);
  });

  test("create permission group panel", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Auth Groups", "Permissions");
    await page.getByRole("button", { name: "Create group" }).click();
    await runA11yAuditForPanel(page, testInfo);
    await closePanel(page);
  });

  test("edit permission group panel", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Auth Groups", "Permissions");
    await page.getByRole("button", { name: "Edit group" }).first().click();
    await runA11yAuditForPanel(page, testInfo);
    await closePanel(page);
  });

  test("create IDP group panel", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "IDP groups", "Permissions");
    await page.getByRole("button", { name: "Create IDP group" }).click();
    await runA11yAuditForPanel(page, testInfo);
    await closePanel(page);
  });

  test("edit IDP group panel", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "IDP groups", "Permissions");
    await page
      .getByRole("button", { name: "Edit IDP group details" })
      .first()
      .click();
    await runA11yAuditForPanel(page, testInfo);
    await closePanel(page);
  });
});

test.describe("settings", () => {
  test("list page", async ({ page }, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
    await clickSideNavItem(page, "Settings");
    await runA11yAudit(page, testInfo);
  });
});
