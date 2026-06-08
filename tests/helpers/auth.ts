import { gotoURLWithNetworkIdle } from "./navigate";
import { runCommand } from "./shell";
import type { Page } from "@playwright/test";

const NESTED_DEPLOYMENTS = ["clustered", "unclustered", "single-node-cluster"];

export const isNestedDeployment = () => {
  return NESTED_DEPLOYMENTS.includes(process.env.DEPLOYMENT ?? "");
};

export const getExecPrefix = () => {
  return isNestedDeployment() ? "lxc exec vm1 -- " : "";
};

export const getLxcCmd = () => {
  return `${getExecPrefix()}lxc`;
};

export const getLxdCmd = () => {
  return `${getExecPrefix()}lxd`;
};

export const removeCertificateTrust = () => {
  const lxcCmd = getLxcCmd();

  try {
    const fingerprint = runCommand(
      `${lxcCmd} config trust list | grep -E "lxd-ui.crt|stdin" | awk '{print $8}'`,
    );

    if (fingerprint) {
      runCommand(`${lxcCmd} config trust remove ${fingerprint}`);
    }
    runCommand(`${lxcCmd} auth identity delete tls/lxd-ui || true`);
  } catch (err) {
    console.error("Error occurred while removing certificate trust:", err);
  }
};

export const restoreCertificateTrust = () => {
  const cmd = isNestedDeployment()
    ? "cat keys/lxd-ui.crt | sudo lxc exec vm1 -- lxc config trust add -"
    : "lxc config trust add keys/lxd-ui.crt";
  runCommand(cmd);
};

const initAccessLink = (baseUrl: string) => {
  const lxdCmd = getLxdCmd();
  const output = runCommand(`${lxdCmd} init --ui-initial-access-link`);
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
