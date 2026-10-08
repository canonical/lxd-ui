import { expect } from "../fixtures/lxd-test";
import { randomNameSuffix } from "./name";
import type { Page } from "@playwright/test";
import { gotoURL } from "./navigate";
import { dismissNotification } from "./notification";
import { runCommand } from "./shell";
import { getRemoteClusterVm } from "./cluster";

export const DELETE_ALL_CLUSTER_LINKS_COMMAND =
  "lxc cluster link list --format csv | cut -d, -f1 | xargs -r -n1 lxc cluster link delete";

export const randomLinkName = (): string => {
  return `playwright-cluster-link-${randomNameSuffix()}`;
};

export const visitClusterLinks = async (page: Page) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Clustering" }).click();
  await page.getByRole("link", { name: "Links" }).click();
  await expect(
    page.getByRole("button").filter({ hasText: "Create cluster link" }),
  ).toBeVisible();
};

export const createClusterLinkBidirectional = async (
  page: Page,
  link: string,
  token?: string,
) => {
  await page.getByRole("button", { name: "Create cluster link" }).click();
  await expect(
    page.getByRole("heading", { name: "Choose cluster link type" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Bidirectional" }).click();

  if (token) {
    await page.getByLabel("Token setup").selectOption("consume");
    await page.getByPlaceholder("Enter token").fill(token);
  } else {
    await page.getByLabel("Token setup").selectOption("generate");
  }

  await page.getByPlaceholder("Enter name").fill(link);
  const panel = page.getByLabel("Side panel");

  panel.getByRole("rowheader").filter({ hasText: "admins" }).click();

  await panel.getByRole("button", { name: "Create link" }).click();

  await expect(page.getByText(`Cluster link ${link} created`)).toBeVisible();

  if (!token) {
    await page.getByText("I have copied the token").click();
    await page.getByRole("button", { name: "Done" }).click();
  } else {
    await dismissNotification(page, `Cluster link ${link} created.`);
  }
};

export const createClusterLinkUnidirectional = async (
  page: Page,
  link: string,
  token: string,
) => {
  await page.getByRole("button", { name: "Create cluster link" }).click();

  await expect(
    page.getByRole("heading", { name: "Choose cluster link type" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Unidirectional" }).click();

  await page.getByPlaceholder("Enter token").fill(token);
  await page.getByPlaceholder("Enter name").fill(link);
  const panel = page.getByLabel("Side panel");
  await panel.getByRole("button", { name: "Create link" }).click();

  await dismissNotification(page, `Cluster link ${link} created.`);
};

// Fills in the public link details and fetches the remote certificate,
// leaving the side panel on the "Verify certificate" step
export const fetchPublicClusterLinkCertificate = async (
  page: Page,
  link: string,
  remoteAddress: string,
) => {
  await page.getByRole("button", { name: "Create cluster link" }).click();

  await expect(
    page.getByRole("heading", { name: "Choose cluster link type" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Public" }).click();

  await page.getByPlaceholder("Enter address").fill(remoteAddress);
  await page.getByPlaceholder("Enter name").fill(link);
  const panel = page.getByLabel("Side panel");
  await panel.getByRole("button", { name: "Fetch certificate" }).click();

  await expect(
    panel.getByRole("heading", { name: /Verify certificate/ }),
  ).toBeVisible();
  await expect(panel.locator("#certificate-fingerprint")).toHaveText(
    /^[0-9a-f]{64}$/,
  );
};

export const getRemoteClusterAddress = () => {
  const remoteVm = getRemoteClusterVm();
  const output = runCommand(`lxc list ${remoteVm} --format csv -c 4`);
  return output.replace(/"/g, "").trim().split(" ")[0].split(",")[0];
};

export const clusterLinkExists = (link: string) => {
  const output = runCommand("lxc cluster link list --format csv");
  return output.split("\n").some((line) => line.split(",")[0] === link);
};

export const editClusterLink = async (page: Page, link: string) => {
  const row = page.getByRole("row").filter({ hasText: link });
  await row.getByRole("button", { name: "Edit cluster link" }).click();
  await expect(page.getByText(`Edit cluster link ${link}`)).toBeVisible();

  const description = "My link";
  await page.getByPlaceholder("Enter description").fill(description);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText(`Cluster link ${link} saved.`)).toBeVisible();

  await expect(row.getByText(description)).toBeVisible();
};

export const deleteClusterLink = async (page: Page, link: string) => {
  const row = page.getByRole("row").filter({ hasText: link });
  await row.getByRole("button", { name: "Delete cluster link" }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete cluster link" })
    .click();

  await dismissNotification(page, `Cluster link ${link} deleted.`);
};

export const createClusterLinkOnRemoteCluster = (link: string) => {
  const remoteVm = getRemoteClusterVm();
  const generateTokenCommand = `lxc cluster link create ${link} --auth-group admins`;
  const output = runCommand(
    `lxc exec ${remoteVm} -- sh -c '${generateTokenCommand}'`,
  )
    .toString()
    .trim();

  // Extract token from the output (it's on the last line)
  return output.split("\n").pop() || "";
};

export const deleteClusterLinkOnRemoteCluster = (link: string) => {
  const remoteVm = getRemoteClusterVm();
  runCommand(`lxc exec ${remoteVm} -- sh -c 'lxc cluster link delete ${link}'`);
};

export const createIdentityOnRemoteCluster = (link: string) => {
  const remoteVm = getRemoteClusterVm();
  const generateIdentityCmd = `lxc auth identity create cluster-link/${link} --group admins`;
  const output = runCommand(
    `lxc exec ${remoteVm} -- sh -c '${generateIdentityCmd}'`,
  )
    .toString()
    .trim();

  // Extract token from the output (it's on the last line)
  return output.split("\n").pop() || "";
};

export const deleteIdentityOnRemoteCluster = (link: string) => {
  const remoteVm = getRemoteClusterVm();
  runCommand(
    `lxc exec ${remoteVm} -- sh -c 'lxc auth identity delete tls/${link}'`,
  );
};
