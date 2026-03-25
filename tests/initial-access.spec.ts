import { test, expect } from "./fixtures/lxd-test";
import {
  removeCertificateTrust,
  restoreCertificateTrust,
  visitInitialAccessLink,
} from "./helpers/auth";
import { randomIdentityName } from "./helpers/permission-identities";
import type { LxdVersions } from "./fixtures/lxd-test";

const skipIfNotSupported = (lxdVersion: LxdVersions) => {
  test.skip(
    lxdVersion === "5.0-edge" || lxdVersion === "5.21-edge",
    "Initial access link is not available for LXD prior to 6.7",
  );
};

test.describe("Initial access with bearer token", () => {
  test.beforeAll(({ lxdVersion }) => {
    if (lxdVersion === "5.0-edge" || lxdVersion === "5.21-edge") {
      return;
    }

    removeCertificateTrust();
  });

  test.afterAll(({ lxdVersion }) => {
    if (lxdVersion === "5.0-edge" || lxdVersion === "5.21-edge") {
      return;
    }

    restoreCertificateTrust();
  });

  test("Should authenticate with bearer token and setup TLS", async ({
    page,
    baseURL,
    lxdVersion,
  }) => {
    skipIfNotSupported(lxdVersion);

    if (!baseURL) {
      test.fail(true, "Missing baseUrl from configuration");
      return;
    }

    await visitInitialAccessLink(page, baseURL);

    await expect(page).toHaveURL(/\/ui\/project\/.*\/instances/);
    await expect(page.getByText("Initial access expires in")).toBeVisible();
    await page.getByRole("link", { name: "Set up permanent access" }).click();
    await page.getByRole("link", { name: "Set up TLS login" }).click();
    await expect(page).toHaveURL(/.*\/ui\/login\/certificate-generate/);

    await expect(
      page.getByText(
        "LXD uses mutual TLS for server client-server authentication. Your browser must have a client certificate installed and selected in order to proceed.",
      ),
    ).toBeVisible();

    // Pre-load CertificateAdd page to avoid flaky test on dev server
    await page.getByText("Create TLS identity", { exact: true }).click();
    await expect(
      page.getByText(
        "Confirm the name and auth groups for your permanent access.",
      ),
    ).toBeVisible();
    await page.getByText("Browser certificate").click();

    const generateBtn = page.getByRole("button", {
      name: "Generate certificate",
    });
    await generateBtn.click();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Generate and download" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain(".pfx");

    await expect(
      page.getByText("Client certificate already present"),
    ).toBeVisible();
    await expect(
      page.getByText(
        "It looks like you already have a client certificate installed and selected, skip to the next step.",
      ),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Skip to step 2: Create TLS identity",
      })
      .click();

    await expect(page).toHaveURL(/.*\/ui\/login\/certificate-add/);
    const nameInput = page.getByRole("textbox", { name: "Name" });
    await expect(nameInput).toHaveValue(/lxd-ui.*/);
    const identityName = randomIdentityName();
    await nameInput.fill(identityName);
    await expect(nameInput).toHaveValue(identityName);

    const adminsCheckbox = page.getByRole("checkbox", { name: /admins/i });
    await expect(adminsCheckbox).toBeChecked();
    await expect(adminsCheckbox).toBeDisabled();

    await page.getByRole("button", { name: "Create identity" }).click();

    await expect(page).toHaveURL(/\/ui\/project\/.*\/instances/);
    await expect(
      page.getByRole("link", { name: "Set up permanent access" }),
    ).not.toBeVisible();
    await page
      .getByRole("button", { name: "Permissions", exact: true })
      .click();
    await page.getByRole("link", { name: "Identities", exact: true }).click();

    const myIdentityRow = page
      .getByRole("row")
      .filter({ hasText: identityName });
    await expect(myIdentityRow).toBeVisible();
    await expect(myIdentityRow.getByText("You", { exact: true })).toBeVisible();
    await expect(myIdentityRow.getByText("Client certificate")).toBeVisible();

    await myIdentityRow
      .getByRole("button", {
        name: "Delete identity",
      })
      .click();
    await page
      .getByRole("button", {
        name: "Delete",
        exact: true,
      })
      .click();

    await expect(page).toHaveURL(/\/ui\/login/);
  });
});
