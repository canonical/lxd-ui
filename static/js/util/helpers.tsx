import React from "react";

export const isoTimeToString = (isoTime: string) => {
  if (isoTime.startsWith("0001-01-01T00")) {
    return "";
  }

  return new Date(isoTime).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const stringToIsoTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return date.toISOString();
};

export const getTomorrowMidnight = (date: Date = new Date()) => {
  // set date as next day
  date.setDate(date.getDate() + 1);
  // set time to midnight
  date.setHours(0, 0, 0, 0);
  // compute timezone offset
  const tzOffset = date.getTimezoneOffset() * 60000;
  // return ISO string w/o tzOffset, seconds and milliseconds
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

interface ErrorResponse {
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

export const humanFileSize = (bytes: number, toBibyte = false) => {
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

export const getWsErrorMsg = (code: number) => {
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

export const checkDuplicateName = (
  candidate: string | undefined,
  controllerState: [
    AbortController | null,
    React.Dispatch<React.SetStateAction<AbortController | null>>
  ],
  target: string
) => {
  if (!candidate) {
    return true;
  }
  const [controller, setController] = controllerState;
  if (controller) controller.abort();
  const deduplicateController = new AbortController();
  setController(deduplicateController);
  const signal = deduplicateController.signal;
  return fetch(`/1.0/${target}/${candidate}`, { signal }).then(
    (response) => response.status === 404
  );
};
