import type { FC } from "react";
import { useState } from "react";
import {
  ActionButton,
  Button,
  Input,
  Modal,
  Notification,
  useToastNotification,
} from "@canonical/react-components";
import { updateCluster } from "api/cluster";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNavigate } from "react-router-dom";
import { useSettings } from "context/useSettings";

interface Props {
  onClose: () => void;
}

const EnableClusteringModal: FC<Props> = ({ onClose }) => {
  const [serverName, setServerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: settings } = useSettings();

  const hasClusterAddress =
    settings?.config?.["cluster.https_address"] !== undefined;

  const handleEnable = () => {
    setIsLoading(true);
    const payload = JSON.stringify({
      server_name: serverName,
      enabled: true,
    });

    updateCluster(payload)
      .then(() => {
        toastNotify.success("Clustering enabled.");
        queryClient.invalidateQueries({
          queryKey: [queryKeys.settings],
        });
        navigate("/ui/cluster/members");
      })
      .catch((e) => {
        toastNotify.failure("Failed to enable clustering", e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Modal
      close={onClose}
      title="Enable clustering"
      buttonRow={
        <>
          <Button
            aria-label="Close"
            className="u-no-margin--bottom"
            onClick={onClose}
            type="button"
          >
            Close
          </Button>
          <ActionButton
            appearance="positive"
            aria-label="Close"
            loading={isLoading}
            className="u-no-margin--bottom"
            onClick={handleEnable}
            disabled={serverName.length === 0 || !hasClusterAddress}
            type="button"
          >
            Enable clustering
          </ActionButton>
        </>
      }
    >
      {hasClusterAddress ? (
        <Input
          label="Server name"
          type="text"
          required
          value={serverName}
          onChange={(e) => {
            setServerName(e.target.value);
          }}
        />
      ) : (
        <Notification
          severity="negative"
          title="Missing cluster.https_address"
          actions={[
            {
              label: "Go to Settings",
              onClick: () => {
                navigate("/ui/settings");
              },
            },
          ]}
        >
          The server setting <code>cluster.https_address</code>is empty.
        </Notification>
      )}
    </Modal>
  );
};

export default EnableClusteringModal;
