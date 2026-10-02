import type { FC } from "react";
import { Tooltip } from "@canonical/react-components";
import { useSettings } from "context/useSettings";
import DsIcon from "components/DsIcon";
import {
  RECENT_MAJOR_SERVER_VERSION,
  UI_GIT_HASH,
  UI_VERSION,
} from "util/version";

const Version: FC = () => {
  const { data: settings } = useSettings();

  const serverVersion = settings?.environment?.server_version;
  if (!serverVersion) {
    return null;
  }

  const serverMajor = serverVersion.includes(".")
    ? serverVersion.split(".")[0]
    : undefined;
  const isOutdated = serverMajor
    ? parseInt(serverMajor) < RECENT_MAJOR_SERVER_VERSION
    : false;

  return (
    <>
      <span
        className="server-version p-text--small"
        title={`ui-hash: ${UI_GIT_HASH}`}
      >
        {isOutdated && (
          <Tooltip
            message="You are using an outdated server version. Update your LXD server to benefit from the latest features."
            tooltipClassName="version-warning"
            zIndex={1000}
          >
            <DsIcon icon="warning" className="version-warning-icon" />
          </Tooltip>
        )}
        Version {serverVersion}-ui-{UI_VERSION}
      </span>
    </>
  );
};

export default Version;
