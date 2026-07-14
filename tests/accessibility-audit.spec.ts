import { test } from "./fixtures/lxd-test";
import { runA11yAudit } from "./helpers/a11y";

test("accessibility audit for instance page", async ({ page }) => {
  const slug = "Instances";
  await runA11yAudit(slug, page, test.info());
});

test("accessibility audit for profile page", async ({ page }) => {
  const slug = "Profiles";
  await runA11yAudit(slug, page, test.info());
});

test("accessibility audit for network pages", async ({ page }) => {
  const slug = "Networking";
  await runA11yAudit("Networks", page, test.info(), slug);
  await runA11yAudit("ACLs", page, test.info(), slug);
  await runA11yAudit("IPAM", page, test.info(), slug);
});

test("accessibility audit for storage pages", async ({ page }) => {
  const slug = "Storage";
  await runA11yAudit("Pools", page, test.info(), slug);
  await runA11yAudit("Volumes", page, test.info(), slug);
  await runA11yAudit("Buckets", page, test.info(), slug);
  await runA11yAudit("Custom ISOs", page, test.info(), slug);
});

test("accessibility audit for image page", async ({ page }) => {
  const slug = "Images";
  await runA11yAudit("Local images", page, test.info(), slug);
});

test("accessibility audit for project page", async ({ page }) => {
  const slug = "Configuration";
  await runA11yAudit(slug, page, test.info());
});

test("accessibility audit for clustering pages", async ({ page }) => {
  const slug = "Clustering";
  await runA11yAudit("Server", page, test.info(), slug);
  await runA11yAudit("Groups", page, test.info(), slug);
  await runA11yAudit("Links", page, test.info(), slug);
  await runA11yAudit("Placement", page, test.info(), slug);
  await runA11yAudit("Replicators", page, test.info(), slug);
});

test("accessibility audit for operations page", async ({ page }) => {
  const slug = "Operations";
  await runA11yAudit(slug, page, test.info());
});

test("accessibility audit for warning page", async ({ page }) => {
  const slug = "Warnings";
  await runA11yAudit(slug, page, test.info());
});

test("accessibility audit for permissions pages", async ({ page }) => {
  const slug = "Permissions";
  await runA11yAudit("Identities", page, test.info(), slug);
  await runA11yAudit("Groups", page, test.info(), slug);
  await runA11yAudit("IDP groups", page, test.info(), slug);
});

test("accessibility audit for settings page", async ({ page }) => {
  const slug = "Settings";
  await runA11yAudit(slug, page, test.info());
});
