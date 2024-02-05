import { LxdApiResponse } from "types/apiResponse";
import { LxdInstance } from "types/instance";
import { LxdProject } from "types/project";
import { LxdProfile } from "types/profile";
import { LxdNetwork } from "types/network";
import { LxdStorageVolume } from "types/storage";
import { Dispatch, SetStateAction } from "react";
import crypto from "crypto";

export const UNDEFINED_DATE = "0001-01-01T00:00:00Z";

export const isoTimeToString = (isoTime: string): string => {
  if (isoTime === UNDEFINED_DATE) {
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

interface ErrorResponse {
  error_code: number;
  error: string;
}

export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result: ErrorResponse = await response.json();
    throw Error(result.error);
  }
  return response.json();
};

export const handleSettledResult = (
  results: PromiseSettledResult<unknown>[],
): void => {
  const error = (
    results.find((res) => res.status === "rejected") as
      | PromiseRejectedResult
      | undefined
  )?.reason as Error | undefined;

  if (error) {
    throw error;
  }
};

export const handleEtagResponse = async (response: Response) => {
  const data = (await handleResponse(response)) as LxdApiResponse<
    LxdInstance | LxdProject | LxdProfile | LxdNetwork | LxdStorageVolume
  >;
  const result = data.metadata;
  result.etag = response.headers.get("etag")?.replace("W/", "") ?? undefined;
  return result;
};

export const handleTextResponse = async (
  response: Response,
): Promise<string> => {
  if (!response.ok) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result: ErrorResponse = await response.json();
    throw Error(result.error);
  }
  return response.text();
};

export const humanFileSize = (bytes: number, toBibyte = false): string => {
  if (Math.abs(bytes) < 1000) {
    return `${bytes} B`;
  }

  const units = toBibyte
    ? ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
    : ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let u = -1;

  do {
    bytes /= toBibyte ? 1024 : 1000;
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

export const checkDuplicateName = (
  candidate: string | undefined,
  project: string,
  controllerState: AbortControllerState,
  target: string,
) => {
  if (!candidate) {
    return true;
  }
  const [controller, setController] = controllerState;
  if (controller) controller.abort();
  const deduplicateController = new AbortController();
  setController(deduplicateController);
  const signal = deduplicateController.signal;
  return fetch(`/1.0/${target}/${candidate}?project=${project}`, {
    signal,
  }).then((response) => response.status === 404);
};

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

export const getParentsBottomSpacing = (element: Element): number => {
  let sum = 0;
  while (element.parentElement) {
    element = element.parentElement;
    const style = window.getComputedStyle(element);
    const margin = parseInt(style.marginBottom);
    const padding = parseInt(style.paddingBottom);
    sum += margin + padding;
  }
  return sum;
};

export const getPromiseSettledCounts = (
  results: PromiseSettledResult<void>[],
): { fulfilledCount: number; rejectedCount: number } => {
  const fulfilledCount = results.filter(
    (result) => result.status === "fulfilled",
  ).length;
  const rejectedCount = results.filter(
    (result) => result.status === "rejected",
  ).length;
  return { fulfilledCount, rejectedCount };
};

export const pushSuccess = (results: PromiseSettledResult<void>[]): void => {
  results.push({
    status: "fulfilled",
    value: undefined,
  });
};

export const pushFailure = (
  results: PromiseSettledResult<void>[],
  msg: string,
): void => {
  results.push({
    status: "rejected",
    reason: msg,
  });
};

export const continueOrFinish = (
  results: PromiseSettledResult<void>[],
  totalLength: number,
  resolve: (value: PromiseSettledResult<void>[]) => void,
): void => {
  if (totalLength === results.length) {
    resolve(results);
  }
};

export const logout = (): void =>
  void fetch("/oidc/logout").then(() => {
    if (!window.location.href.includes("/ui/login")) {
      window.location.href = "/ui/login";
    }
  });

export const capitalizeFirstLetter = (val: string): string =>
  val.charAt(0).toUpperCase() + val.slice(1);

export const getAbsoluteHeightBelow = (belowId: string): number => {
  const element = belowId ? document.getElementById(belowId) : undefined;
  if (!element) {
    return 0;
  }
  const style = window.getComputedStyle(element);
  const margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
  const padding =
    parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  return element.offsetHeight + margin + padding + 1;
};

export const generateUUID = (): string => {
  return crypto.randomBytes(16).toString("hex");
};
