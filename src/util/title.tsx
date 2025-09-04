import { useEffect } from "react";
import { useSettings } from "context/useSettings";
import { hasMicroCloudFlag } from "util/settings";

export const setTitle = (): void => {
  const { data: settings } = useSettings();
  const isMicroCloud = hasMicroCloudFlag(settings);
  const suffix = isMicroCloud ? "MicroCloud" : "LXD UI";

  const favicon = document.querySelector("link[rel='shortcut icon']");
  if (favicon && isMicroCloud) {
    (favicon as HTMLLinkElement).href = "/assets/img/microCloud-32x32.png";
  }

  useEffect(() => {
    const host = settings?.config?.["user.ui_title"] ?? location.hostname;
    document.title = `${host} | ${suffix}`;
  }, [settings?.config]);
};
