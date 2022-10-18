export const isoTimeToString = (isoTime: string) => {
  return new Date(isoTime).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const handleResponse = (response: Response) => {
  if (!response.ok) {
    throw Error();
  }
  return response.json();
};

export const humanFileSize = (bytes: number) => {
  if (Math.abs(bytes) < 1000) {
    return bytes + " B";
  }

  const units = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let u = -1;

  do {
    bytes /= 1000;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * 10) / 10 >= 1000 &&
    u < units.length - 1
  );

  return bytes.toFixed(1) + " " + units[u];
};
