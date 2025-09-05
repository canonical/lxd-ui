import { useEffect } from "react";
import { useSettings } from "context/useSettings";
import { hasMicroCloudFlag } from "util/settings";

export const setFavicon = (): void => {
  const { data: settings } = useSettings();
  const isMicroCloud = hasMicroCloudFlag(settings);

  useEffect(() => {
    if (!isMicroCloud) {
      return;
    }

    const favicon = document.querySelector("link[rel='shortcut icon']");
    if (!favicon) {
      return;
    }
    (favicon as HTMLLinkElement).href = "/assets/img/microCloud-32x32.png";
  }, [settings?.config]);
};
