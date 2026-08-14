import { test } from "./fixtures/lxd-test";
import {
  clickSideNavItem,
  closePanel,
  hasTableRows,
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

const instance = randomInstanceName();

test("accessibility audit for instance page", async ({ page }, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);
  const slug = "Instances";
  await runA11yAudit(slug, page, testInfo);
});

test("accessibility audit for profile page", async ({ page }, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

  const slug = "Profiles";
  await runA11yAudit(slug, page, test.info());
});

test("accessibility audit for network pages", async ({ page }, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

  const slug = "Networking";
  await runA11yAudit("Networks", page, test.info(), slug);
  await runA11yAudit("ACLs", page, test.info(), slug);
  await runA11yAudit("IPAM", page, test.info(), slug);
});

test("accessibility audit for storage pages", async ({ page }, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

  const slug = "Storage";
  await runA11yAudit("Pools", page, test.info(), slug);
  await runA11yAudit("Volumes", page, test.info(), slug);
  await runA11yAudit("Buckets", page, test.info(), slug);
  await runA11yAudit("Custom ISOs", page, test.info(), slug);
});

test("accessibility audit for image page", async ({ page }, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

  const slug = "Images";
  await runA11yAudit("Local images", page, test.info(), slug);
});

test("accessibility audit for project page", async ({ page }, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

  const slug = "Configuration";
  await runA11yAudit(slug, page, test.info());
});

test("accessibility audit for clustering pages", async ({ page }, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

  // Test passes on a non-clustered environment.
  const slug = "Clustering";
  await runA11yAudit("Server", page, test.info(), slug);
  await runA11yAudit("Groups", page, test.info(), slug);
  await runA11yAudit("Placement", page, test.info(), slug);
  await runA11yAudit("Links", page, test.info(), slug);
  await runA11yAudit("Replicators", page, test.info(), slug);
});

test("accessibility audit for operations page", async ({ page }, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

  const slug = "Operations";
  await runA11yAudit(slug, page, test.info());
});

test("accessibility audit for warning page", async ({ page }, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

  const slug = "Warnings";
  await runA11yAudit(slug, page, test.info());
});

test("accessibility audit for permissions pages", async ({
  page,
}, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

  const slug = "Permissions";
  await runA11yAudit("Identities", page, test.info(), slug);
  await runA11yAudit("Groups", page, test.info(), slug);
  await runA11yAudit("IDP groups", page, test.info(), slug);
});

test("accessibility audit for settings page", async ({ page }, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

  const slug = "Settings";
  await runA11yAudit(slug, page, test.info());
});

// A11y tests for Side panel components

test("accessibility audit for instance summary panel", async ({
  page,
}, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);
  await createInstance(page, instance);
  await openInstancePanel(page, instance);

  await runA11yAuditForPanel("instance-summary-panel", page, test.info());
  await deleteInstance(page, instance);
});

test("accessibility audit for storage bucket panels", async ({
  page,
}, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

  await clickSideNavItem(page, "Buckets", "Storage");

  await page.getByRole("button", { name: "Create bucket" }).click();
  await runA11yAuditForPanel("create-storage-bucket-panel", page, test.info());
  await closePanel(page);

  // const hasData = await hasTableRows(page);
  // if (hasData) {
  //   await page.getByRole("button", { name: "Edit bucket" }).first().click();
  //   await runA11yAuditForPanel("edit-storage-bucket-panel", page, test.info());
  //   await closePanel(page);
  // }
});

// test("accessibility audit for clustering group panels", async ({
//   page,
// }, testInfo) => {
//   skipIfNotA11yProject(testInfo.project.name);

//   await clickSideNavItem(page, "Groups", "Clustering");

//   await page.getByRole("button", { name: "Create group" }).click();
//   await runA11yAuditForPanel("create-cluster-group-panel", page, test.info());
//   await closePanel(page);

//   const hasData = await hasTableRows(page);
//   if (hasData) {
//     await page.getByRole("button", { name: "Edit group" }).first().click();
//     await runA11yAuditForPanel("edit-cluster-group-panel", page, test.info());
//     await closePanel(page);
//   }
// });

test("accessibility audit for clustering link panels", async ({
  page,
}, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

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

  // const hasData = await hasTableRows(page);
  // if (hasData) {
  //   await page
  //     .getByRole("button", { name: "Edit cluster link" })
  //     .first()
  //     .click();
  //   await runA11yAuditForPanel("edit-cluster-link-panel", page, test.info());
  //   await closePanel(page);
  // }
});

test("accessibility audit for clustering replicator panels", async ({
  page,
}, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

  await clickSideNavItem(page, "Replicators", "Clustering");

  await page.getByRole("button", { name: "Create replicator" }).click();
  await runA11yAuditForPanel("create-replicator-panel", page, test.info());
  await closePanel(page);

  // const hasData = await hasTableRows(page);
  // if (hasData) {
  //   await page.getByRole("button", { name: "Edit replicator" }).first().click();
  //   await runA11yAuditForPanel("edit-replicator-panel", page, test.info());
  //   await closePanel(page);
  // }
});

test("accessibility audit for permissions identity panels", async ({
  page,
}, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

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

test("accessibility audit for permissions group panels", async ({
  page,
}, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

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

test("accessibility audit for permissions IDP group panels", async ({
  page,
}, testInfo) => {
  skipIfNotA11yProject(testInfo.project.name);

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

// Clustering must be enabled
// test("accessibility audit for placement group panels", async ({
//   page,
// }, testInfo) => {
//   skipIfNotA11yProject(testInfo.project.name);

//   await clickSideNavItem(page, "Placement", "Clustering");

//   await page.getByRole("button", { name: "Create placement group" }).click();
//   await runA11yAuditForPanel("create-placement-group-panel", page, test.info());
//   await closePanel(page);

//   const hasData = await hasTableRows(page);
//   if (hasData) {
//     await page
//       .getByRole("button", { name: "Edit placement group" })
//       .first()
//       .click();
//     await runA11yAuditForPanel("edit-placement-group-panel", page, test.info());
//     await closePanel(page);
//   }
// });

// Not enabled here
// test("accessibility audit for image registry panel", async ({
//   page,
// }, testInfo) => {
//   skipIfNotA11yProject(testInfo.project.name);

//   await clickSideNavItem(page, "Image registries", "Images");

//   await page.getByRole("button", { name: "Create registry" }).click();
//   await runA11yAuditForPanel("create-image-registry-panel", page, test.info());
// });

// A11y tests for modal components
