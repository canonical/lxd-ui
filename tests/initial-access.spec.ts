import { test, expect } from "./fixtures/lxd-test";
import { initAccessLink, skipIfNotSupported } from "./helpers/initial-access";
import { randomIdentityName } from "./helpers/permission-identities";
import { runCommand } from "./helpers/permissions";

test.describe("Initial access with bearer token", () => {
  test.beforeAll(({ lxdVersion }) => {
    if (lxdVersion === "5.0-edge" || lxdVersion === "5.21-edge") {
      return;
    }

    try {
      const fingerprint = runCommand(
        `lxc config trust list | grep lxd-ui.crt | awk '{print $8}'`,
      );
      runCommand(`lxc config trust remove ${fingerprint}`);
      runCommand(`lxc auth identity delete tls/lxd-ui || true`);
    } catch (err) {
      console.error("Error occurred during setup:", err);
    }
  });

  test.afterAll(({ lxdVersion }) => {
    if (lxdVersion === "5.0-edge" || lxdVersion === "5.21-edge") {
      return;
    }

    try {
      runCommand(`lxc auth identity delete tls/lxd-ui || true`);
      runCommand(
        `lxc auth identity create tls/lxd-ui --group admins keys/lxd-ui.crt || true`,
      );

      console.log("Environment restored: lxd-ui is now an admin via TLS.");
    } catch (err) {
      console.error("Error occurred during clean up:", err);
    }
  });

  test("Should authenticate via link and show expiration banner", async ({
    page,
    lxdVersion,
  }) => {
    skipIfNotSupported(lxdVersion);

    const initialAccessLink = initAccessLink();
    await page.goto(initialAccessLink, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/ui\/project\/.*\/instances/);
    await expect(page.getByText("Initial access expires in")).toBeVisible();
    const setupLink = page.getByRole("link", {
      name: "Set up permanent access",
    });
    await expect(setupLink).toBeVisible();
  });

  test("Should navigate to TLS setup and generate certificate", async ({
    page,
    lxdVersion,
  }) => {
    skipIfNotSupported(lxdVersion);

    const initialAccessLink = initAccessLink();
    await page.goto(initialAccessLink, { waitUntil: "networkidle" });
    await page.getByRole("link", { name: /set up permanent access/i }).click();
    await page.getByRole("link", { name: "Set up TLS login" }).click();
    await expect(page).toHaveURL(/.*\/ui\/login\/certificate-generate/);

    await expect(
      page.getByText(
        "LXD uses mutual TLS for server client-server authentication. Your browser must have a client certificate installed and selected in order to proceed.",
      ),
    ).toBeVisible();

    const generateBtn = page.getByRole("button", {
      name: "Generate certificate",
    });
    await generateBtn.click();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Generate and download" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain(".pfx");
  });

  test("Should add certificate when browser certificate is already configured", async ({
    page,
    lxdVersion,
  }) => {
    skipIfNotSupported(lxdVersion);

    const initialAccessLink = initAccessLink();
    await page.goto(initialAccessLink, { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Set up permanent access" }).click();
    await page.getByRole("link", { name: "Set up TLS login" }).click();

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
    // TLS column is hidden because of narrow screen
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
  });
});
