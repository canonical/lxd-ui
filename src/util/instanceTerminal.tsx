import type { LxdInstance } from "types/instance";
import type { TerminalConnectPayload } from "types/terminal";
import { isInstanceRunning } from "util/instanceStatus";

export const UI_TERMINAL_DEFAULT_PAYLOAD = "user.ui_terminal_default_payload";

const AGENT_START_TIMEOUT_MS = 60 * 1000;

// LXD reports no processes for a running virtual machine until its LXD agent
// is up. A slow boot can't be told apart from a guest without agent, such as
// Windows, so only assume a missing agent once the instance ran for a while.
export const isAgentLikelyMissing = (
  instance: LxdInstance,
  now = Date.now(),
): boolean => {
  const hasNoProcesses = (instance.state?.processes ?? 0) < 1;
  const startedAt = new Date(instance.last_used_at).getTime();

  return (
    instance.type === "virtual-machine" &&
    isInstanceRunning(instance) &&
    hasNoProcesses &&
    now - startedAt > AGENT_START_TIMEOUT_MS
  );
};

const BASH_DISTROS = ["ubuntu", "debian", "fedora"];

const getCommand = (instance: LxdInstance): string => {
  const os = instance.config["image.os"]?.toLowerCase() || "";

  if (BASH_DISTROS.includes(os)) {
    return "bash -il";
  }

  return "su -l";
};

const getEnvironment = (instance: LxdInstance) => {
  const os = instance.config["image.os"]?.toLowerCase() || "";

  const environment = [
    {
      key: "TERM",
      value: "xterm-256color",
    },
    {
      key: "HOME",
      value: "/root",
    },
    {
      key: "PATH",
      value:
        "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin:/run/current-system/sw/bin",
    },
    {
      key: "LANG",
      value: "C.UTF-8",
    },
    {
      key: "USER",
      value: "root",
    },
  ];

  if (BASH_DISTROS.includes(os)) {
    environment.push({
      key: "force_color_prompt",
      value: "yes",
    });
  }

  return environment;
};

const createDefaultPayload = (instance: LxdInstance) => {
  return {
    command: getCommand(instance),
    environment: getEnvironment(instance),
    user: 0,
    group: 0,
  };
};

export const getDefaultPayload = (instance: LxdInstance) => {
  const userPayload = instance.config[UI_TERMINAL_DEFAULT_PAYLOAD];
  if (userPayload) {
    return JSON.parse(userPayload) as TerminalConnectPayload;
  }

  return createDefaultPayload(instance);
};
