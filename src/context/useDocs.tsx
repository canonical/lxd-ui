import { useSettings } from "context/useSettings";

export const useDocs = (): string => {
  const remoteBase = "https://documentation.ubuntu.com/lxd/en/latest";
  const localBase = "/documentation";

  const { data: settings } = useSettings();
  const serverVersion = settings?.environment?.server_version;
  const serverMajor = parseInt(serverVersion?.split(".")[0] ?? "0");
  const serverMinor = parseInt(serverVersion?.split(".")[1] ?? "0");

  if (
    !serverVersion ||
    serverMajor < 5 ||
    (serverMajor === 5 && serverMinor < 19)
  ) {
    return remoteBase;
  }

  return localBase;
};
