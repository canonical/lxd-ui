import {
  ActionButton,
  Button,
  ScrollableContainer,
  SidePanel,
  Spinner,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import type { FC } from "react";
import usePanelParams from "util/usePanelParams";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { pluralize } from "util/instanceBulkActions";
import type { LxdNetwork, LxdNetworkPeer } from "types/network";
import NetworkLocalPeeringForm from "../forms/NetworkLocalPeeringForm";
import type { LocalPeeringFormValues } from "../forms/NetworkLocalPeeringForm";
import { useLocalPeering } from "context/useLocalPeerings";
import { updateNetworkPeer } from "api/network-local-peering";
import ResourceLink from "components/ResourceLink";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  network: LxdNetwork;
}
const EditLocalPeeringPanel: FC<Props> = ({ network }) => {
  const panelParams = usePanelParams();
  const { project, localPeering } = panelParams;
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };
  const networkURL = `${ROOT_PATH}/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(network.name)}`;

  const {
    data: localPeer,
    error,
    isLoading,
  } = useLocalPeering(network, project, localPeering ?? "");

  const handleSuccess = () => {
    toastNotify.success(
      <>
        Local peering{" "}
        <ResourceLink
          type={"peering"}
          value={localPeering ?? ""}
          to={`${networkURL}/local-peerings`}
        />{" "}
        updated.
      </>,
    );
    closePanel();
  };

  const formik = useFormik<LocalPeeringFormValues>({
    initialValues: {
      name: localPeer?.name ?? "",
      description: localPeer?.description,
      targetProject: localPeer?.target_project ?? "",
      targetNetwork: localPeer?.target_network ?? "",
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      const localPeeringPayload = {
        name: values.name,
        description: values.description,
        target_project: values.targetProject,
        target_network: values.targetNetwork,
      } as LxdNetworkPeer;

      updateNetworkPeer(
        network.name,
        localPeering ?? "",
        project,
        localPeeringPayload,
      )
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              project,
              queryKeys.networks,
              network.name,
              queryKeys.peers,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              project,
              queryKeys.networks,
              network.name,
              queryKeys.peers,
              localPeering,
            ],
          });
          handleSuccess();
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure(`Local peering update failed`, e);
        });
    },
  });

  if (!localPeer) {
    return <>Missing local peering</>;
  }

  if (error) {
    notify.failure("Loading local peering failed", error);
  }

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  const changeCount =
    formik.values.description !== localPeer?.description ? 1 : 0;

  return (
    <>
      <SidePanel>
        <SidePanel.Header>
          <SidePanel.HeaderTitle className="u-truncate">
            Edit local peering {localPeering}
          </SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[notify.notification]}
            belowIds={["panel-footer"]}
          >
            <NetworkLocalPeeringForm
              formik={formik}
              network={network}
              isEditing={true}
            />
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
            disabled={
              !formik.isValid || formik.isSubmitting || changeCount === 0
            }
          >
            {changeCount === 0
              ? "Save changes"
              : `Save ${changeCount} ${pluralize("change", changeCount)}`}
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};

export default EditLocalPeeringPanel;
