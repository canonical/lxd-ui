import AxeBuilder from "@axe-core/playwright";
import { test } from "./fixtures/lxd-test";
import {
  clickSideNavItem,
  closePanel,
  hasTableRows,
  processA11yResults,
  runA11yAudit,
  runA11yAuditForPanel,
  skipIfNotA11yProject,
} from "./helpers/a11y";
import {
  createInstance,
  deleteInstance,
  randomInstanceName,
} from "./helpers/instances";
import { openInstancePanel } from "./helpers/instancePanel";
import { gotoURL } from "./helpers/navigate";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wca21aa", "best-practice"];

const instance = randomInstanceName();

test.describe("a11y: main pages", () => {
  test.beforeEach((_fixtures, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
  });

  test("instance page", async ({ page }) => {
    await runA11yAudit("Instances", page, test.info());
  });

  test("profile page", async ({ page }) => {
    await runA11yAudit("Profiles", page, test.info());
  });

  test("network pages", async ({ page }) => {
    const slug = "Networking";
    await runA11yAudit("Networks", page, test.info(), slug);
    await runA11yAudit("ACLs", page, test.info(), slug);
    await runA11yAudit("IPAM", page, test.info(), slug);
  });

  test("storage pages", async ({ page }) => {
    const slug = "Storage";
    await runA11yAudit("Pools", page, test.info(), slug);
    await runA11yAudit("Volumes", page, test.info(), slug);
    await runA11yAudit("Buckets", page, test.info(), slug);
    await runA11yAudit("Custom ISOs", page, test.info(), slug);
  });

  test("image page", async ({ page }) => {
    await runA11yAudit("Local images", page, test.info(), "Images");
  });

  test("project page", async ({ page }) => {
    await runA11yAudit("Configuration", page, test.info());
  });

  test("clustering pages", async ({ page }) => {
    // Test passes on a non-clustered environment.
    const slug = "Clustering";
    await runA11yAudit("Server", page, test.info(), slug);
    await runA11yAudit("Groups", page, test.info(), slug);
    await runA11yAudit("Placement", page, test.info(), slug);
    await runA11yAudit("Links", page, test.info(), slug);
    await runA11yAudit("Replicators", page, test.info(), slug);
  });

  test("operations page", async ({ page }) => {
    await runA11yAudit("Operations", page, test.info());
  });

  test("warning page", async ({ page }) => {
    await runA11yAudit("Warnings", page, test.info());
  });

  test("permissions pages", async ({ page }) => {
    const slug = "Permissions";
    await runA11yAudit("Identities", page, test.info(), slug);
    await runA11yAudit("Groups", page, test.info(), slug);
    await runA11yAudit("IDP groups", page, test.info(), slug);
  });

  test("settings page", async ({ page }) => {
    await runA11yAudit("Settings", page, test.info());
  });
});

test.describe("a11y: side panels", () => {
  test.beforeEach((_fixtures, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
  });

  test("instance summary panel", async ({ page }) => {
    await createInstance(page, instance);
    await openInstancePanel(page, instance);

    await runA11yAuditForPanel("instance-summary-panel", page, test.info());
    await deleteInstance(page, instance);
  });

  test("storage bucket panels", async ({ page }) => {
    await clickSideNavItem(page, "Buckets", "Storage");

    await page.getByRole("button", { name: "Create bucket" }).click();
    await runA11yAuditForPanel(
      "create-storage-bucket-panel",
      page,
      test.info(),
    );
    await closePanel(page);
  });

  test("clustering link panels", async ({ page }) => {
    await clickSideNavItem(page, "Links", "Clustering");

    await page.getByRole("button", { name: "Create cluster link" }).click();
    await runA11yAuditForPanel(
      "create-cluster-link-direction-panel",
      page,
      test.info(),
    );

    await page.getByRole("button", { name: "Bidirectional" }).click();
    await runA11yAuditForPanel(
      "create-cluster-link-details-panel",
      page,
      test.info(),
    );

    await page.getByRole("button", { name: "Back" }).click();
    await closePanel(page);
  });

  test("clustering replicator panels", async ({ page }) => {
    await clickSideNavItem(page, "Replicators", "Clustering");

    await page.getByRole("button", { name: "Create replicator" }).click();
    await runA11yAuditForPanel("create-replicator-panel", page, test.info());
    await closePanel(page);
  });

  test("permissions identity panels", async ({ page }) => {
    await clickSideNavItem(page, "Identities", "Permissions");

    await page.getByRole("button", { name: "Create identity" }).click();
    await runA11yAuditForPanel(
      "create-identity-type-selection-panel",
      page,
      test.info(),
    );

    await page.getByRole("button", { name: "Client certificate" }).click();
    await runA11yAuditForPanel(
      "create-identity-details-panel",
      page,
      test.info(),
    );

    await page.getByRole("button", { name: "Back" }).click();
    await closePanel(page);

    const hasData = await hasTableRows(page);
    if (hasData) {
      await page.getByRole("button", { name: "Edit identity" }).first().click();
      await runA11yAuditForPanel("edit-identity-panel", page, test.info());
      await closePanel(page);
    }
  });

  test("permissions group panels", async ({ page }) => {
    await clickSideNavItem(page, "Groups", "Permissions");

    await page.getByRole("button", { name: "Create group" }).click();
    await runA11yAuditForPanel("create-group-panel", page, test.info());
    await closePanel(page);

    const hasData = await hasTableRows(page);
    if (hasData) {
      await page.getByRole("button", { name: "Edit group" }).first().click();
      await runA11yAuditForPanel("edit-group-panel", page, test.info());
      await closePanel(page);
    }
  });

  test("permissions IDP group panels", async ({ page }) => {
    await clickSideNavItem(page, "IDP groups", "Permissions");

    await page.getByRole("button", { name: "Create IDP group" }).click();
    await runA11yAuditForPanel("create-idp-group-panel", page, test.info());
    await closePanel(page);

    const hasData = await hasTableRows(page);
    if (hasData) {
      await page
        .getByRole("button", { name: "Edit IDP group details" })
        .first()
        .click();
      await runA11yAuditForPanel("edit-idp-group-panel", page, test.info());
      await closePanel(page);
    }
  });
});

test.describe("a11y: create pages", () => {
  test.beforeEach((_fixtures, testInfo) => {
    skipIfNotA11yProject(testInfo.project.name);
  });

  test("create instance page", async ({ page }) => {
    await runA11yAudit(
      "Instances",
      page,
      test.info(),
      undefined,
      "Create instance",
    );
  });

  test("create profile page", async ({ page }) => {
    await runA11yAudit(
      "Profiles",
      page,
      test.info(),
      undefined,
      "Create profile",
    );
  });

  test("create network page", async ({ page }) => {
    await runA11yAudit(
      "Networks",
      page,
      test.info(),
      "Networking",
      "Create network",
    );
  });

  test("create network ACL page", async ({ page }) => {
    await runA11yAudit("ACLs", page, test.info(), "Networking", "Create ACL");
  });

  test("create storage pool page", async ({ page }) => {
    await runA11yAudit("Pools", page, test.info(), "Storage", "Create pool");
  });

  test("create storage volume page", async ({ page }) => {
    await runA11yAudit(
      "Volumes",
      page,
      test.info(),
      "Storage",
      "Create volume",
    );
  });

  test("create project page", async ({ page }) => {
    await gotoURL(page, "/ui/project/default");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "default" }).click();
    await page.getByRole("button", { name: "Create project" }).click();
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();

    await processA11yResults("create-project", results, test.info(), "a11y");
  });
});

// A11y tests for modal components
