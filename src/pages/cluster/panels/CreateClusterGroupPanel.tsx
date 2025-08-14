import {
  ActionButton,
  Button,
  ScrollableContainer,
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
import { createClusterGroup } from "api/cluster-groups";
import ResourceLink from "components/ResourceLink";
import type { ClusterGroupFormValues } from "pages/cluster/ClusterGroupForm";
import ClusterGroupForm from "pages/cluster/ClusterGroupForm";

const CreateClusterGroupPanel: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const formik = useFormik<ClusterGroupFormValues>({
    initialValues: {
      name: "",
      description: "",
      members: [],
    },
    onSubmit: (values) => {
      const payload = {
        name: values.name,
        description: values.description,
        members: values.members,
      };

      createClusterGroup(payload)
        .then(() => {
          toastNotify.success(
            <>
              Cluster group{" "}
              <ResourceLink
                type="cluster-group"
                value={values.name}
                to="/ui/cluster/groups"
              />{" "}
              created.
            </>,
          );
          closePanel();
        })
        .catch((e) => {
          notify.failure("Cluster group creation failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          queryClient.invalidateQueries({
            queryKey: [queryKeys.cluster, queryKeys.groups],
          });
          queryClient.invalidateQueries({
            queryKey: [queryKeys.cluster, queryKeys.groups, values.name],
          });
        });
    },
  });

  return (
    <SidePanel>
      <SidePanel.Header>
        <SidePanel.HeaderTitle>Create cluster group</SidePanel.HeaderTitle>
      </SidePanel.Header>
      <NotificationRow className="u-no-padding" />
      <SidePanel.Content className="u-no-padding">
        <ScrollableContainer
          dependencies={[notify.notification]}
          belowIds={["panel-footer"]}
        >
          <ClusterGroupForm formik={formik} />
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
            !formik.isValid || formik.isSubmitting || !formik.values.name
          }
        >
          Create group
        </ActionButton>
      </SidePanel.Footer>
    </SidePanel>
  );
};

export default CreateClusterGroupPanel;
