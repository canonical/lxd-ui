import { useEffect } from "react";
import { useSettings } from "context/useSettings";
import { hasMicroCloudFlag } from "util/settings";
import { ROOT_PATH } from "util/rootPath";

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
    (favicon as HTMLLinkElement).href =
      `${ROOT_PATH}/ui/assets/img/microCloud-32x32.png`;
  }, [settings?.config]);
};
