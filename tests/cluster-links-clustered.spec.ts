import { test, expect } from "./fixtures/lxd-test";
import {
  deleteClusterLink,
  editClusterLink,
  randomLinkName,
  createClusterLinkOnRemoteCluster,
  deleteClusterLinkOnRemoteCluster,
  visitClusterLinks,
  createIdentityOnRemoteCluster,
  deleteIdentityOnRemoteCluster,
  createClusterLinkUnidirectional,
  createClusterLinkBidirectional,
  fetchPublicClusterLinkCertificate,
  getRemoteClusterAddress,
  clusterLinkExists,
  createPendingPublicClusterLink,
  skipIfUnidirectionalClusterLinksNotSupported,
} from "./helpers/cluster-links";
import { skipIfNotClustered } from "./helpers/cluster";
import { dismissNotification } from "./helpers/notification";
import { randomInstanceName } from "./helpers/instances";
import { promoteProjectToLeader, randomProjectName } from "./helpers/projects";
import {
  createReplicator,
  deleteAllAfterReplicatorTest,
  deleteReplicatorFromDetailPage,
  randomReplicatorName,
  setupProjectsForReplicator,
  visitReplicators,
} from "./helpers/replicators";

test("cluster link type can be changed in the create form", async ({
  page,
}, testInfo) => {
  skipIfNotClustered(testInfo.project.name);

  await visitClusterLinks(page);
  await page.getByRole("button", { name: "Create cluster link" }).click();
  const panel = page.getByLabel("Side panel");
  await expect(
    panel.getByRole("heading", { name: "Create cluster link", exact: true }),
  ).toBeVisible();
  await expect(
    panel.getByRole("radio", { name: "Bidirectional", exact: true }),
  ).toBeChecked();

  await panel.getByLabel("Token setup").selectOption("generate");
  await panel.getByPlaceholder("Enter name").fill(randomLinkName());
  await panel.getByPlaceholder("Enter description").fill("My link");

  await panel
    .getByRole("radiogroup", { name: "Link type" })
    .getByText("Public", { exact: true })
    .click();
  await panel.getByPlaceholder("Enter address").fill("999.1.1.1");
  await panel.getByPlaceholder("Enter address").blur();
  await expect(
    panel.getByText(
      "Enter a valid IP address or hostname, optionally with a port",
    ),
  ).toBeVisible();

  await panel
    .getByRole("radiogroup", { name: "Link type" })
    .getByText("Bidirectional", { exact: true })
    .click();
  await expect(panel.getByLabel("Token setup")).toHaveValue("");
  await expect(panel.getByPlaceholder("Enter description")).toHaveValue(
    "My link",
  );
  const createButton = panel.getByRole("button", {
    name: "Create",
    exact: true,
  });
  await expect(createButton).toBeDisabled();
  await panel.getByLabel("Token setup").selectOption("generate");
  await expect(createButton).toBeEnabled();

  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
});

test("cluster link create edit delete", async ({ page }, testInfo) => {
  skipIfNotClustered(testInfo.project.name);

  const link = randomLinkName();
  await visitClusterLinks(page);
  await createClusterLinkBidirectional(page, link);
  const row = page.getByRole("row").filter({ hasText: link });
  await expect(row).toBeVisible();
  await expect(row.getByRole("cell", { name: "Type" })).toHaveText(
    "Bidirectional",
  );
  await expect(row.getByRole("cell", { name: "Status" })).toHaveText("Pending");
  await expect(row.getByRole("cell", { name: "Addresses" })).toHaveText("-");
  await expect(row.getByRole("cell", { name: "Description" })).toHaveText("");

  await editClusterLink(page, link);
  await expect(row.getByRole("cell", { name: "Description" })).toHaveText(
    "My link",
  );

  await deleteClusterLink(page, link);
  await expect(row).toHaveCount(0);
});

test("cluster link table displays all links", async ({ page }, testInfo) => {
  skipIfNotClustered(testInfo.project.name);

  const link1 = randomLinkName();
  const link2 = randomLinkName();
  await visitClusterLinks(page);
  await createClusterLinkBidirectional(page, link1);
  await createClusterLinkBidirectional(page, link2);

  const row1 = page.getByRole("row").filter({ hasText: link1 });
  const row2 = page.getByRole("row").filter({ hasText: link2 });

  await expect(row1).toBeVisible();
  await expect(row2).toBeVisible();

  await deleteClusterLink(page, link1);
  await deleteClusterLink(page, link2);
});

test("consume token to create cluster link", async ({ page }, testInfo) => {
  skipIfNotClustered(testInfo.project.name);

  const link = randomLinkName();
  await visitClusterLinks(page);

  const token = createClusterLinkOnRemoteCluster(link);
  await createClusterLinkBidirectional(page, link, token);

  const row = page.getByRole("row").filter({ hasText: link });
  await expect(row.getByRole("cell", { name: "Status" })).toHaveText(
    "Reachable",
  );
  await expect(row.getByRole("cell", { name: "Auth groups" })).toHaveText("1");

  deleteClusterLinkOnRemoteCluster(link);
  await deleteClusterLink(page, link);
});

test("cluster link deletion is blocked while in use by a replicator", async ({
  page,
}, testInfo) => {
  skipIfNotClustered(testInfo.project.name);

  const project = randomProjectName();
  const instance = randomInstanceName();
  const clusterLink = randomLinkName();
  const replicator = randomReplicatorName();

  await setupProjectsForReplicator(page, project, instance, clusterLink);
  await createReplicator(page, replicator, clusterLink, project);
  await promoteProjectToLeader(page, project);

  await visitClusterLinks(page);
  const linkRow = page.getByRole("row").filter({ hasText: clusterLink });
  await linkRow.getByRole("button", { name: "Delete cluster link" }).click();

  const dialog = page.getByRole("dialog", {
    name: "Cannot delete cluster link",
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("This cluster link is used by:")).toBeVisible();
  await expect(dialog.getByText("Replicator (1)")).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Delete cluster link" }),
  ).toBeDisabled();

  await dialog.getByRole("button", { name: "Cancel" }).click();

  // Remove the replicator so the cluster link is no longer in use
  await visitReplicators(page);
  const replicatorRow = page.getByRole("row").filter({ hasText: replicator });
  await replicatorRow.getByRole("link", { name: replicator }).click();
  await expect(page.getByRole("heading", { name: "General" })).toBeVisible();
  await deleteReplicatorFromDetailPage(page, replicator);

  // deleteAllAfterReplicatorTest navigates to cluster links and deletes via the
  // normal "Confirm delete" dialog, implicitly verifying the link is unblocked.
  await deleteAllAfterReplicatorTest(page, project, clusterLink);
});

test("create unidirectional cluster link", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfNotClustered(testInfo.project.name);
  skipIfUnidirectionalClusterLinksNotSupported(lxdVersion);

  const link = randomLinkName();
  await visitClusterLinks(page);

  const token = createIdentityOnRemoteCluster(link);
  await createClusterLinkUnidirectional(page, link, token);

  const row = page.getByRole("row").filter({ hasText: link });
  await expect(row.getByRole("cell", { name: "Status" })).toHaveText(
    "Reachable",
  );
  await expect(row.getByRole("cell", { name: "Auth groups" })).toHaveText("0");

  await editClusterLink(page, link);

  deleteIdentityOnRemoteCluster(link);
  await deleteClusterLink(page, link);
});

test("create public cluster link", async ({ page }, testInfo) => {
  skipIfNotClustered(testInfo.project.name);

  const link = randomLinkName();
  const remoteAddress = `${getRemoteClusterAddress()}:8443`;
  const panel = page.getByLabel("Side panel");
  await visitClusterLinks(page);

  await fetchPublicClusterLinkCertificate(page, link, remoteAddress);
  await expect(panel.getByPlaceholder("Enter address")).toHaveValue(
    remoteAddress,
  );
  await expect(
    panel.getByRole("button", { name: "Fetch certificate" }),
  ).toBeDisabled();
  await expect(panel.getByPlaceholder("Enter name")).toBeDisabled();
  for (const type of ["Bidirectional", "Unidirectional", "Public"]) {
    await expect(
      panel.getByRole("radio", { name: type, exact: true }),
    ).toBeDisabled();
  }
  expect(clusterLinkExists(link)).toBe(true);

  // Editing the description requires fetching again before confirming.
  await panel.getByPlaceholder("Enter description").fill("Public images");
  await expect(panel.locator("#certificate-fingerprint")).toHaveCount(0);
  await panel.getByRole("button", { name: "Fetch certificate" }).click();
  await expect(panel.locator("#certificate-fingerprint")).toBeVisible();

  // Confirming the fingerprint creates the link.
  const createButton = panel.getByRole("button", {
    name: "Create",
    exact: true,
  });
  await expect(createButton).toBeDisabled();
  await panel
    .getByText(
      "I confirm this fingerprint matches the target LXD server's certificate.",
    )
    .click();
  await createButton.click();
  await dismissNotification(page, `Cluster link ${link} created.`);

  const row = page.getByRole("row").filter({ hasText: link });
  await expect(row.getByRole("cell", { name: "Type" })).toHaveText("Public");
  await expect(row.getByRole("cell", { name: "Status" })).toHaveText(
    "Reachable",
  );

  await editClusterLink(page, link);
  await deleteClusterLink(page, link);
});

test("failed public certificate refetch cannot restore a stale fingerprint", async ({
  page,
}, testInfo) => {
  skipIfNotClustered(testInfo.project.name);

  const link = randomLinkName();
  const remoteAddress = `${getRemoteClusterAddress()}:8443`;
  const panel = page.getByLabel("Side panel");
  await visitClusterLinks(page);

  await fetchPublicClusterLinkCertificate(page, link, remoteAddress);
  await panel
    .getByText(
      "I confirm this fingerprint matches the target LXD server's certificate.",
    )
    .click();
  await expect(panel.getByRole("checkbox")).toBeChecked();

  // An unused local port triggers a real connection failure.
  await panel.getByPlaceholder("Enter address").fill("127.0.0.1:1");
  await panel.getByPlaceholder("Enter description").fill("Retry details");
  await panel.getByRole("button", { name: "Fetch certificate" }).click();
  await expect(panel.getByText("Fetching certificate failed")).toBeVisible();

  await panel.getByPlaceholder("Enter address").fill(remoteAddress);
  await panel.getByPlaceholder("Enter description").fill("");
  await expect(panel.locator("#certificate-fingerprint")).toHaveCount(0);
  await expect(
    panel.getByRole("button", { name: "Create", exact: true }),
  ).toBeDisabled();
  await expect(panel.getByPlaceholder("Enter name")).toBeDisabled();
  for (const type of ["Bidirectional", "Unidirectional", "Public"]) {
    await expect(
      panel.getByRole("radio", { name: type, exact: true }),
    ).toBeDisabled();
  }

  await panel.getByRole("button", { name: "Fetch certificate" }).click();
  await expect(panel.locator("#certificate-fingerprint")).toHaveText(
    /^[0-9a-f]{64}$/,
  );
  await expect(panel.getByRole("checkbox")).not.toBeChecked();
  await expect(
    panel.getByRole("button", { name: "Create", exact: true }),
  ).toBeDisabled();
  await panel
    .getByText(
      "I confirm this fingerprint matches the target LXD server's certificate.",
    )
    .click();
  await panel.getByRole("button", { name: "Create", exact: true }).click();
  await dismissNotification(page, `Cluster link ${link} created.`);
  await deleteClusterLink(page, link);
});

test("verify certificate of a pending public cluster link", async ({
  page,
}, testInfo) => {
  skipIfNotClustered(testInfo.project.name);

  const link = randomLinkName();
  createPendingPublicClusterLink(link, `${getRemoteClusterAddress()}:8443`);
  await visitClusterLinks(page);

  const row = page.getByRole("row").filter({ hasText: link });
  await expect(row.getByRole("cell", { name: "Status" })).toHaveText("Pending");
  await row
    .getByRole("button", { name: "Verify cluster link certificate" })
    .click();

  const panel = page.getByLabel("Side panel");
  await expect(
    panel.getByRole("heading", { name: `Verify certificate for ${link}` }),
  ).toBeVisible();
  await expect(panel.locator("#certificate-fingerprint")).toHaveText(
    /^[0-9a-f]{64}$/,
  );
  const createButton = panel.getByRole("button", {
    name: "Create",
    exact: true,
  });
  await expect(createButton).toBeDisabled();
  await panel
    .getByText(
      "I confirm this fingerprint matches the target LXD server's certificate.",
    )
    .click();
  await createButton.click();
  await dismissNotification(page, `Cluster link ${link} created.`);

  await expect(row.getByRole("cell", { name: "Status" })).toHaveText(
    "Reachable",
  );
  await expect(
    row.getByRole("button", { name: "Verify cluster link certificate" }),
  ).toHaveCount(0);

  await deleteClusterLink(page, link);
});
