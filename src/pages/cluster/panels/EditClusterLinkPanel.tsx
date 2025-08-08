import {
  ActionButton,
  Button,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import usePanelParams from "util/usePanelParams";
import { useFormik } from "formik";
import { queryKeys } from "util/queryKeys";
import NotificationRow from "components/NotificationRow";
import ScrollableContainer from "components/ScrollableContainer";
import { updateClusterLink } from "api/cluster-links";
import ResourceLink from "components/ResourceLink";
import { useClusterLink } from "context/useClusterLinks";
import type { LxdIdentity } from "types/permissions";
import { updateIdentity } from "api/auth-identities";
import type { ClusterLinkFormValues } from "pages/cluster/ClusterLinkForm";
import ClusterLinkForm from "pages/cluster/ClusterLinkForm";

interface Props {
  identity: LxdIdentity;
}

const EditClusterLinkPanel: FC<Props> = ({ identity }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { data: clusterLink } = useClusterLink(panelParams.identity ?? "");

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const formik = useFormik<ClusterLinkFormValues>({
    initialValues: {
      name: clusterLink?.name ?? "",
      description: clusterLink?.description ?? "",
      authGroups: identity?.groups ?? [],
      isCreating: false,
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      const payload = {
        name: clusterLink?.name,
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
                to="/ui/cluster/links"
              />{" "}
              saved.
            </>,
          );
        })
        .catch((e) => {
          notify.failure("Cluster link update failed", e);
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
        <SidePanel.HeaderTitle>
          Edit cluster link {clusterLink?.name}
        </SidePanel.HeaderTitle>
      </SidePanel.Header>
      <NotificationRow className="u-no-padding" />
      <SidePanel.Content className="u-no-padding">
        <ScrollableContainer
          dependencies={[notify.notification]}
          belowIds={["panel-footer"]}
        >
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
