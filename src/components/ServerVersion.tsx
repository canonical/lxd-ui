import React, { FC } from "react";
import { Icon, Tooltip } from "@canonical/react-components";
import { useSettings } from "context/useSettings";

const ServerVersion: FC = () => {
  const { data: settings } = useSettings();

  const version = settings?.environment?.server_version;
  if (!version) {
    return null;
  }

  const major = version.includes(".") ? version.split(".")[0] : undefined;
  const recentMajor = 5;
  const isOutdated = major ? parseInt(major) < recentMajor : false;

  return (
    <>
      <hr className="p-side-navigation__list is-dark navigation-hr" />
      <li className="p-side-navigation__link server-version">
        {isOutdated && (
          <Tooltip
            message="You are using an outdated version.
Update your LXD server to benefit from the latest features."
            tooltipClassName="version-warning"
            zIndex={1000}
          >
            <Icon name="warning" className="p-side-navigation__icon" />
          </Tooltip>
        )}
        Server {version}
      </li>
    </>
  );
};

export default ServerVersion;
