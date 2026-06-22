import { expect, test, type LxdVersions } from "../fixtures/lxd-test";
import { randomNameSuffix } from "./name";
import type { Page } from "@playwright/test";
import { gotoURL } from "./navigate";
import { dismissNotification } from "./notification";
import { runCommand } from "./shell";
import { getRemoteClusterVm } from "./cluster";

export const skipIfClusterLinksNotSupported = (lxdVersion: LxdVersions) => {
  test.skip(
    lxdVersion === "5.0-edge" || lxdVersion === "5.21-edge",
    "Cluster link tests not supported for lxd 5.0 and 5.21",
  );
};

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

export const createClusterLink = async (
  page: Page,
  link: string,
  token?: string,
) => {
  await page.getByRole("button", { name: "Create cluster link" }).click();
  await expect(
    page.getByRole("heading", { name: "Create cluster link" }),
  ).toBeVisible();
  await page.getByPlaceholder("Enter name").fill(link);
  const panel = page.getByLabel("Side panel");
  if (token) {
    await page.getByText("I have a token").click();
    await page.getByPlaceholder("Enter token").fill(token);
  }
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
