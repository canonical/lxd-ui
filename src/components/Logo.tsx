import type { FC } from "react";
import { NavLink } from "react-router-dom";
import classNames from "classnames";
import { useCurrentProject } from "context/useCurrentProject";
import { useFeatureFlags } from "context/useFeatureFlags";
import { useSettings } from "context/useSettings";
import { getHomeUrl } from "util/projects";
import { hasMicroCloudFlag } from "util/settings";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  light?: boolean;
}

const Logo: FC<Props> = ({ light }) => {
  const { projectName } = useCurrentProject();
  const { data: settings } = useSettings();
  const { isOverviewEnabled } = useFeatureFlags();
  const isMicroCloud = hasMicroCloudFlag(settings);

  const src = isMicroCloud
    ? `${ROOT_PATH}/ui/assets/img/microCloud-logo.svg`
    : `${ROOT_PATH}/ui/assets/img/lxd-logo.svg`;
  const heading = isMicroCloud ? "MicroCloud" : "LXD";

  return (
    <NavLink
      className="p-panel__logo"
      to={getHomeUrl(projectName ?? "", isOverviewEnabled())}
    >
      <img src={src} alt="LXD-UI logo" className="p-panel__logo-image" />
      <div
        className={classNames("logo-text p-heading--4", { "is-light": light })}
      >
        {heading}
      </div>
    </NavLink>
  );
};

export default Logo;
