import type { FC } from "react";
import { useCurrentProject } from "context/useCurrentProject";
import { NavLink } from "react-router-dom";
import { useSettings } from "context/useSettings";

const Logo: FC = () => {
  const { project, isLoading } = useCurrentProject();
  const { data: settings } = useSettings();

  const isMicroCloud = Boolean(settings?.config?.["user.microcloud"]);
  const src = isMicroCloud
    ? "/ui/assets/img/microCloud-logo.svg"
    : "/ui/assets/img/lxd-logo.svg";
  const heading = isMicroCloud ? "MicroCloud" : "Canonical LXD";

  const getLogoLink = () => {
    if (isLoading || !project) {
      return "/ui/";
    }
    return `/ui/project/${project.name}`;
  };

  return (
    <NavLink className="p-panel__logo" to={getLogoLink()}>
      <img src={src} alt="LXD-UI logo" className="p-panel__logo-image" />
      <div className="logo-text p-heading--4">{heading}</div>
    </NavLink>
  );
};

export default Logo;
