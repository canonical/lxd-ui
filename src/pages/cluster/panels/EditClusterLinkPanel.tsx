import {
  ActionButton,
  Button,
  failure,
  Notification,
  type NotificationType,
  Row,
  ScrollableContainer,
  SidePanel,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import { useState } from "react";
import usePanelParams from "util/usePanelParams";
import { useFormik } from "formik";
import { queryKeys } from "util/queryKeys";
import { updateClusterLink } from "api/cluster-links";
import ResourceLink from "components/ResourceLink";
import { useClusterLink } from "context/useClusterLinks";
import type { LxdIdentity } from "types/permissions";
import { updateIdentity } from "api/auth-identities";
import type { ClusterLinkFormValues } from "pages/cluster/ClusterLinkForm";
import ClusterLinkForm from "pages/cluster/ClusterLinkForm";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  identity: LxdIdentity;
}

const EditClusterLinkPanel: FC<Props> = ({ identity }) => {
  const panelParams = usePanelParams();
  const [error, setError] = useState<NotificationType | null>(null);
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { data: clusterLink } = useClusterLink(panelParams.identity ?? "");

  const closePanel = () => {
    panelParams.clear();
    setError(null);
  };

  const formik = useFormik<ClusterLinkFormValues>({
    initialValues: {
      name: clusterLink?.name ?? "",
      description: clusterLink?.description ?? "",
      authGroups: identity?.groups ?? [],
      isCreating: false,
      initialAuthGroups: identity?.groups ?? [],
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      const payload = {
        ...clusterLink,
        description: values.description,
      };

      updateClusterLink(clusterLink?.name ?? "", JSON.stringify(payload))
        .then(async () => {
          const payloadIdentity = {
            ...identity,
            groups: values.authGroups,
          };
          await updateIdentity(payloadIdentity);
          closePanel();
          toastNotify.success(
            <>
              Cluster link{" "}
              <ResourceLink
                type="cluster-link"
                value={clusterLink?.name ?? ""}
                to={`${ROOT_PATH}/ui/cluster/links`}
              />{" "}
              saved.
            </>,
          );
        })
        .catch((e) => {
          setError(failure("Cluster link update failed", e));
        })
        .finally(() => {
          formik.setSubmitting(false);
          queryClient.invalidateQueries({
            queryKey: [queryKeys.cluster, queryKeys.links],
          });
          queryClient.invalidateQueries({
            queryKey: [queryKeys.identities],
          });
        });
    },
  });

  return (
    <SidePanel>
      <SidePanel.Header>
        <SidePanel.HeaderTitle className="u-truncate">
          <span title={`Edit cluster link ${clusterLink?.name}`}>
            Edit cluster link {clusterLink?.name}
          </span>
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
      <SidePanel.Content className="u-no-padding">
        <ScrollableContainer dependencies={[error]} belowIds={["panel-footer"]}>
          <ClusterLinkForm formik={formik} />
        </ScrollableContainer>
      </SidePanel.Content>
      <SidePanel.Footer className="u-align--right">
        <Button
          appearance="base"
          onClick={closePanel}
          className="u-no-margin--bottom"
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          onClick={() => void formik.submitForm()}
          className="u-no-margin--bottom"
          disabled={!formik.isValid || formik.isSubmitting}
        >
          Save changes
        </ActionButton>
      </SidePanel.Footer>
    </SidePanel>
  );
};

export default EditClusterLinkPanel;
