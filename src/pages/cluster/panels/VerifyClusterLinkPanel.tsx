import {
  ActionButton,
  Button,
  failure,
  Notification,
  type NotificationType,
  Row,
  ScrollableContainer,
  SidePanel,
  Spinner,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FC } from "react";
import usePanelParams from "util/usePanelParams";
import { queryKeys } from "util/queryKeys";
import {
  createClusterLink,
  fetchPublicClusterLinkCertificate,
} from "api/cluster-links";
import ClusterLinkRichChip from "../ClusterLinkRichChip";
import type { LxdClusterLink } from "types/cluster";
import { useEscCallback } from "context/useEscCallback";
import ClusterLinkExplanationTooltip from "pages/cluster/ClusterLinkExplanationTooltip";
import ClusterLinkVerifyCertificate from "pages/cluster/ClusterLinkVerifyCertificate";

interface Props {
  clusterLink: LxdClusterLink;
}

// Finishes a pending public cluster link, for example one left behind when the
// create panel was closed before its certificate was confirmed
const VerifyClusterLinkPanel: FC<Props> = ({ clusterLink }) => {
  const panelParams = usePanelParams();
  const [error, setError] = useState<NotificationType | null>(null);
  const [fingerprint, setFingerprint] = useState("");
  const [isFetching, setFetching] = useState(true);
  const [isConfirmed, setConfirmed] = useState(false);
  const [isConfirming, setConfirming] = useState(false);
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const remoteAddress = clusterLink.config["volatile.pending_address"] ?? "";

  const closePanel = () => {
    panelParams.clear();
    setError(null);
  };

  useEscCallback(closePanel);

  // Sending the pending link request again refreshes it and returns the
  // fingerprint of the remote certificate for verification
  useEffect(() => {
    const payload = {
      name: clusterLink.name,
      type: clusterLink.type,
      remote_address: remoteAddress,
    };
    fetchPublicClusterLinkCertificate(JSON.stringify(payload))
      .then((certificate) => {
        setFingerprint(certificate.fingerprint);
      })
      .catch((e) => {
        setError(failure("Fetching certificate failed", e));
      })
      .finally(() => {
        setFetching(false);
      });
  }, [clusterLink.name]);

  const confirmLink = () => {
    const payload = {
      name: clusterLink.name,
      type: clusterLink.type,
      fingerprint,
    };

    setConfirming(true);
    createClusterLink(JSON.stringify(payload))
      .then(() => {
        toastNotify.success(
          <>
            Cluster link <ClusterLinkRichChip clusterLink={clusterLink.name} />{" "}
            created.
          </>,
        );
        queryClient.invalidateQueries({
          queryKey: [queryKeys.cluster, queryKeys.links],
        });
        closePanel();
      })
      .catch((e) => {
        setError(failure("Cluster link creation failed", e));
      })
      .finally(() => {
        setConfirming(false);
      });
  };

  return (
    <SidePanel>
      <SidePanel.Header>
        <SidePanel.HeaderTitle className="u-truncate">
          <ClusterLinkExplanationTooltip>
            <span title={`Verify certificate for ${clusterLink.name}`}>
              Verify certificate for {clusterLink.name}
            </span>
          </ClusterLinkExplanationTooltip>
        </SidePanel.HeaderTitle>
      </SidePanel.Header>
      <Row className="u-no-padding">
        {error && (
          <Notification
            title={error.title}
            severity="negative"
            onDismiss={() => {
              setError(null);
            }}
          >
            {error.message}
          </Notification>
        )}
      </Row>
      <SidePanel.Content className="u-no-padding cluster-link-panel">
        <ScrollableContainer
          dependencies={[error, isFetching]}
          belowIds={["panel-footer"]}
        >
          {isFetching && (
            <Spinner className="u-loader" text="Fetching certificate..." />
          )}
          {!isFetching && fingerprint && (
            <ClusterLinkVerifyCertificate
              remoteAddress={remoteAddress}
              fingerprint={fingerprint}
              isConfirmed={isConfirmed}
              setConfirmed={setConfirmed}
            />
          )}
        </ScrollableContainer>
      </SidePanel.Content>
      <SidePanel.Footer className="u-align--right">
        <Button
          appearance="base"
          onClick={closePanel}
          className="u-no-margin--bottom"
          disabled={isConfirming}
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          loading={isConfirming}
          onClick={confirmLink}
          className="u-no-margin--bottom"
          disabled={!fingerprint || !isConfirmed || isConfirming}
          title={
            isConfirmed
              ? undefined
              : "Confirm the certificate fingerprint before creating the link"
          }
        >
          Create link
        </ActionButton>
      </SidePanel.Footer>
    </SidePanel>
  );
};

export default VerifyClusterLinkPanel;
