import type { LxdApiResponse } from "types/apiResponse";
import type { LxdInstance } from "types/instance";
import type { LxdProject } from "types/project";
import type { LxdProfile } from "types/profile";
import type { LxdNetwork, LxdNetworkAcl } from "types/network";
import type { LxdStorageVolume } from "types/storage";
import type { Dispatch, SetStateAction } from "react";
import crypto from "crypto";
import { isDiskDevice, isNicDevice } from "./devices";
import { isRootDisk } from "./instanceValidation";
import type { FormDevice } from "./formDevices";
import type { LxdIdentity } from "types/permissions";
import { addTarget } from "util/target";
import { debounceAsync } from "util/debounce";

export const UNDEFINED_DATE = "0001-01-01T00:00:00Z";

export const isoTimeToString = (isoTime: string): string => {
  if (isoTime === UNDEFINED_DATE || !isoTime) {
    return "";
  }

  const date = new Date(isoTime);
  if (date.getTime() === 0) {
    return "Never";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const stringToIsoTime = (dateTime: string): string => {
  const date = new Date(dateTime);
  return date.toISOString();
};

export const getTomorrow = (date: Date = new Date()): string => {
  // set date as next day
  date.setDate(date.getDate() + 1);
  // set time to midnight
  date.setHours(0, 0, 0, 0);
  // compute timezone offset
  const tzOffset = date.getTimezoneOffset() * 60000;
  // return ISO string w/o tzOffset, seconds and milliseconds
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
};

const pad = (v: number): string => `0${v}`.slice(-2);

export const getBrowserFormatDate = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;

export const nonBreakingSpaces = (text: string): string => {
  return text.replace(/ /g, "\u00A0");
};

interface ErrorResponse {
  error_code: number;
  error: string;
}

export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const result = (await response.json()) as ErrorResponse;
    throw Error(result.error);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return response.json();
};

export const handleSettledResult = (
  results: PromiseSettledResult<unknown>[],
): void => {
  const error = results.find((res) => res.status === "rejected")?.reason as
    | Error
    | undefined;

  if (error) {
    throw error;
  }
};

export const handleEtagResponse = async (response: Response) => {
  const data = (await handleResponse(response)) as LxdApiResponse<
    | LxdInstance
    | LxdProject
    | LxdProfile
    | LxdNetwork
    | LxdNetworkAcl
    | LxdStorageVolume
  >;
  const result = data.metadata;
  result.etag = response.headers.get("etag")?.replace("W/", "") ?? undefined;
  return result;
};

export const handleTextResponse = async (
  response: Response,
): Promise<string> => {
  if (!response.ok) {
    const result = (await response.json()) as ErrorResponse;
    throw Error(result.error);
  }
  return response.text();
};

export const handleRawResponse = async (
  response: Response,
): Promise<Response> => {
  if (!response.ok) {
    const result = (await response.json()) as ErrorResponse;
    throw Error(result.error);
  }
  return response;
};

export const humanFileSize = (bytes: number): string => {
  if (Math.abs(bytes) < 1000) {
    return `${bytes} B`;
  }

  const units = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;

  do {
    bytes /= 1024;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * 10) / 10 >= 1000 &&
    u < units.length - 1
  );

  return `${bytes.toFixed(1)} ${units[u]}`;
};

export const getWsErrorMsg = (code: number): string => {
  // See https://www.rfc-editor.org/rfc/rfc6455#section-7.4.1
  if (code == 1000)
    return "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
  if (code == 1001)
    return 'An endpoint is "going away", such as a server going down or a browser having navigated away from a page.';
  if (code == 1002)
    return "An endpoint is terminating the connection due to a protocol error";
  if (code == 1003)
    return "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
  if (code == 1004)
    return "Reserved. The specific meaning might be defined in the future.";
  if (code == 1005) return "No status code was actually present.";
  if (code == 1006)
    return "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
  if (code == 1007)
    return "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [https://www.rfc-editor.org/rfc/rfc3629] data within a text message).";
  if (code == 1008)
    return 'An endpoint is terminating the connection because it has received a message that "violates its policy". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.';
  if (code == 1009)
    return "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
  if (code == 1010)
    return "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake.";
  if (code == 1011)
    return "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
  if (code == 1015)
    return "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
  else return "Unknown reason";
};

export type AbortControllerState = [
  AbortController | null,
  Dispatch<SetStateAction<AbortController | null>>,
];

const validNames: Record<string, string[]> = {};

const _checkDuplicateName = async (
  candidate: string | undefined,
  project: string,
  controllerState: AbortControllerState,
  basePath: string,
  target = "",
) => {
  if (!candidate) {
    return true;
  }
  const [controller, setController] = controllerState;
  if (controller) controller.abort();
  const deduplicateController = new AbortController();
  setController(deduplicateController);
  const signal = deduplicateController.signal;
  const params = new URLSearchParams();
  params.set("project", project);
  addTarget(params, target);

  const validNameKey = `${basePath}-${params.toString()}`;
  if (!validNames[validNameKey]) {
    validNames[validNameKey] = [];
  }
  if (validNames[validNameKey].includes(candidate)) {
    return true;
  }

  return fetch(
    `/1.0/${basePath}/${encodeURIComponent(candidate)}?${params.toString()}`,
    {
      signal,
    },
  ).then((response) => {
    if (response.status === 404) {
      validNames[validNameKey].push(candidate);
      return true;
    }
    return false;
  });
};

export const checkDuplicateName = debounceAsync(_checkDuplicateName, 500);

export const getUrlParam = (paramName: string, url?: string): string | null => {
  const targetUrl = url ?? location.href;
  const browserUrl = new URL(targetUrl);

  return browserUrl.searchParams.get(paramName);
};

export const defaultFirst = (
  p1: { name: string },
  p2: { name: string },
): number => (p1.name === "default" ? -1 : p2.name === "default" ? 1 : 0);

export const isWidthBelow = (width: number): boolean =>
  window.innerWidth < width;

export const logout = (hasOidc?: boolean, hasCertificate?: boolean): void => {
  if (window.location.href.includes("/ui/login")) {
    return;
  }
  void fetch("/oidc/logout").then(() => {
    if (hasOidc) {
      window.location.href = "/ui/login/";
      return;
    }
    if (hasCertificate) {
      window.location.href = "/ui/login/certificate-add";
      return;
    }
    window.location.href = "/ui/login/certificate-generate";
  });
};

export const capitalizeFirstLetter = (val: string): string =>
  val.charAt(0).toUpperCase() + val.slice(1);

export const getElementAbsoluteHeight = (element: HTMLElement) => {
  if (!element) {
    return 0;
  }
  const style = window.getComputedStyle(element);
  const margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
  const padding =
    parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  return element.offsetHeight + margin + padding + 1;
};

export const getAbsoluteHeightBelowById = (belowId: string): number => {
  const element = belowId ? document.getElementById(belowId) : undefined;
  if (!element) {
    return 0;
  }
  return getElementAbsoluteHeight(element);
};

export const getAbsoluteHeightBelowBySelector = (selector: string): number => {
  const element = selector ? document.querySelector(selector) : undefined;
  if (!element) {
    return 0;
  }
  return getElementAbsoluteHeight(element as HTMLElement);
};

export const generateUUID = (): string => {
  return crypto.randomBytes(16).toString("hex");
};

export const getClientOS = (userAgent: string) => {
  if (userAgent.includes("Windows")) {
    return "windows";
  } else if (userAgent.includes("Mac OS")) {
    return "macos";
  } else if (userAgent.includes("Linux")) {
    return "linux";
  }

  return null;
};

export const getFileExtension = (filename: string): string => {
  if (!filename.includes(".")) {
    return "";
  }

  return `.${filename.split(".").pop()}`;
};

export const delay = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getUniqueResourceName = (
  name: string,
  existingResources: { name: string }[],
): string => {
  const resourceNames = existingResources.map((resource) => resource.name);
  if (resourceNames.includes(name)) {
    let count = 1;
    while (resourceNames.includes(`${name}-${count}`)) {
      count++;
    }
    return `${name}-${count}`;
  }

  return name;
};

export const getRootPool = (instance: LxdInstance): string => {
  const rootStorage = Object.values(instance.expanded_devices ?? {})
    .filter(isDiskDevice)
    .find((device) => {
      return isRootDisk(device as FormDevice);
    });
  return rootStorage?.pool ?? "";
};

export const getDefaultStoragePool = (profile: LxdProfile) => {
  const rootStorage = Object.values(profile.devices ?? {})
    .filter(isDiskDevice)
    .find((device) => {
      return isRootDisk(device as FormDevice);
    });
  return rootStorage?.pool ?? "";
};

export const getDefaultNetwork = (profile: LxdProfile) => {
  const networks = Object.values(profile.devices ?? {}).filter(isNicDevice);
  return networks[0]?.network ?? "none";
};

export const isUnrestricted = (identity: LxdIdentity) => {
  // matches both "Client certificate (unrestricted)" and "Metrics certificate (unrestricted)"
  return (
    identity.type.endsWith("(unrestricted)") ||
    identity.type.startsWith("Server certificate")
  );
};

export const isFineGrainedTls = (identity: LxdIdentity) => {
  return ["Client certificate (pending)", "Client certificate"].includes(
    identity.type,
  );
};

export const base64EncodeObject = (data: object) => {
  const jsonString = JSON.stringify(data);
  return btoa(jsonString);
};

export const constructMemberError = (
  result: PromiseRejectedResult,
  member: string,
) => {
  const reason = result.reason as Error;
  const message = `Error from cluster member ${member}: ${reason.message}`;
  return new Error(message);
};

export const truncateEntityName = (name: string, suffix = ""): string => {
  const instanceNameMaxLength = 63;
  if (name.length > instanceNameMaxLength - suffix.length) {
    name = name.slice(0, instanceNameMaxLength - suffix.length);
  }

  return name + suffix;
};

export const sanitizeEntityName = (name: string): string => {
  return name.replace(/[^A-Za-z0-9-]/g, "-");
};

export const fileToSanitisedName = (
  fileName: string,
  suffix?: string,
): string => {
  const fileExtension = getFileExtension(fileName);
  fileName = fileExtension ? fileName.replace(fileExtension, "") : fileName;
  const sanitisedFileName = sanitizeEntityName(fileName);
  const newName = truncateEntityName(sanitisedFileName, suffix);
  return newName;
};
