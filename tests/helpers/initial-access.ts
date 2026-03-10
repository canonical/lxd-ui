import type { LxdVersions } from "../fixtures/lxd-test";
import { test } from "../fixtures/lxd-test";
import { runCommand } from "./permissions";

export const skipIfNotSupported = (lxdVersion: LxdVersions) => {
  test.skip(
    lxdVersion === "5.0-edge" || lxdVersion === "5.21-edge",
    "Initial access link is not available for LXD prior to 6.7",
  );
};

export const initAccessLink = () => {
  const output = runCommand("lxd init --ui-initial-access-link");
  const urlMatch = output.match(/https?:\/\/[^\s]+/);

  if (!urlMatch) {
    throw new Error("Could not find the UI access link in the command output!");
  }

  const originalUrl = new URL(urlMatch[0]);
  // Replace the LXD direct port with your HAProxy dev port
  const initialAccessLink = `https://localhost:8407/${originalUrl.search}`;

  return initialAccessLink;
};
