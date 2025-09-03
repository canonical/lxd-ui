import { useEffect } from "react";
import { useSettings } from "context/useSettings";
import { hasMicroCloudFlag } from "util/settings";

export const setTitle = (): void => {
  const { data: settings } = useSettings();
  const isMicroCloud = hasMicroCloudFlag(settings);
  const suffix = isMicroCloud ? "MicroCloud" : "LXD UI";

  useEffect(() => {
    const host = settings?.config?.["user.ui_title"] ?? location.hostname;
    document.title = `${host} | ${suffix}`;
  }, [settings?.config]);
};
