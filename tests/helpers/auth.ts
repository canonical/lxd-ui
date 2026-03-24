import { gotoURLWithNetworkIdle } from "./navigate";
import { runCommand } from "./shell";
import type { Page } from "@playwright/test";

export const removeCertificateTrust = () => {
  try {
    const fingerprint = runCommand(
      "lxc config trust list | grep lxd-ui.crt | awk '{print $8}'",
    );

    if (fingerprint) {
      runCommand(`lxc config trust remove ${fingerprint}`);
    }
    runCommand("lxc auth identity delete tls/lxd-ui || true");
  } catch (err) {
    console.error("Error occurred while removing certificate trust:", err);
  }
};

export const restoreCertificateTrust = () => {
  runCommand("lxc config trust add keys/lxd-ui.crt");
};

const initAccessLink = (baseUrl: string) => {
  const output = runCommand("lxd init --ui-initial-access-link");
  const urlMatch = output.match(/https?:\/\/[^\s]+/);

  if (!urlMatch) {
    throw new Error("Could not find the UI access link in the command output!");
  }

  const originalUrl = new URL(urlMatch[0]);

  return `${baseUrl}${originalUrl.search}`;
};

export const visitInitialAccessLink = async (page: Page, baseURL: string) => {
  const initialAccessLink = initAccessLink(baseURL);
  await gotoURLWithNetworkIdle(page, initialAccessLink);
};
