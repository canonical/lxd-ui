import React, { FC } from "react";
import { Icon, Tooltip } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchSettings } from "api/server";

const ServerVersion: FC = () => {
  const { data: settings } = useQuery({
    queryKey: [queryKeys.settings],
    queryFn: fetchSettings,
  });

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
