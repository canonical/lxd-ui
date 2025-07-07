import type { FC } from "react";
import type { LxdNetworkAcl } from "types/network";
import {
  Button,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLabel from "components/ResourceLabel";
import { useSmallScreen } from "context/useSmallScreen";
import { fetchNetworkAclLog } from "api/network-acls";

interface Props {
  networkAcl: LxdNetworkAcl;
  project: string;
}

const DownloadNetworkAclLogsBtn: FC<Props> = ({ networkAcl, project }) => {
  const isSmallScreen = useSmallScreen();
  const toastNotify = useToastNotification();

  const startDownload = () => {
    fetchNetworkAclLog(networkAcl.name, project)
      .then((logData) => {
        const blob = new Blob([logData], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const currentTime = new Date()
          .toISOString()
          .replaceAll(":", "-")
          .split(".")[0];
        const backupName = `${networkAcl.name}-${currentTime}.log`;

        const a = document.createElement("a");
        a.href = url;
        a.download = backupName;
        a.click();
        window.URL.revokeObjectURL(url);

        toastNotify.success(
          <>
            Logs download for ACL{" "}
            <ResourceLabel bold type="network-acl" value={networkAcl.name} />{" "}
            started.
          </>,
        );
      })
      .catch((error) => {
        toastNotify.failure(
          `Failed to download logs for ACL ${networkAcl.name}`,
          error,
        );
      });
  };

  return (
    <Button appearance="" type="button" onClick={startDownload} hasIcon>
      {!isSmallScreen && <Icon name="begin-downloading" />}
      <span>Download logs</span>
    </Button>
  );
};

export default DownloadNetworkAclLogsBtn;
