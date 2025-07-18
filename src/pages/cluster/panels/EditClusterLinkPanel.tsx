import {
  ActionButton,
  Button,
  Form,
  Input,
  Label,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import SidePanel from "components/SidePanel";
import type { FC } from "react";
import usePanelParams from "util/usePanelParams";
import { useFormik } from "formik";
import { queryKeys } from "util/queryKeys";
import NotificationRow from "components/NotificationRow";
import ScrollableContainer from "components/ScrollableContainer";
import { updateClusterLink } from "api/cluster-links";
import ResourceLink from "components/ResourceLink";
import GroupSelection from "pages/permissions/panels/GroupSelection";
import { useAuthGroups } from "context/useAuthGroups";
import { useClusterLink } from "context/useClusterLinks";
import type { LxdIdentity } from "types/permissions";
import { updateIdentity } from "api/auth-identities";

export interface EditClusterLinkForm {
  description: string;
  authGroups: string[];
}

interface Props {
  identity: LxdIdentity;
}

const EditClusterLinkPanel: FC<Props> = ({ identity }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { data: clusterLink } = useClusterLink(panelParams.identity ?? "");
  const { data: authGroups = [] } = useAuthGroups();

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const formik = useFormik<EditClusterLinkForm>({
    initialValues: {
      description: clusterLink?.description ?? "",
      authGroups: identity?.groups ?? [],
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
    <SidePanel isOverlay loading={false} hasError={false}>
      <SidePanel.Header>
        <SidePanel.HeaderTitle>Edit cluster link {}</SidePanel.HeaderTitle>
      </SidePanel.Header>
      <NotificationRow className="u-no-padding" />
      <SidePanel.Content className="u-no-padding">
        <ScrollableContainer
          dependencies={[notify.notification]}
          belowIds={["panel-footer"]}
        >
          <Form onSubmit={formik.handleSubmit}>
            {/* hidden submit to enable enter key in inputs */}
            <Input type="submit" hidden value="Hidden input" />
            <Input
              {...formik.getFieldProps("description")}
              type="text"
              label="Description"
              placeholder="Enter description"
            />

            <Label className="u-sv-2">Auth groups</Label>
            <p className="u-text--muted u-sv-1">
              Control access for incoming request on the cluster link.
            </p>
            <GroupSelection
              groups={authGroups}
              modifiedGroups={new Set(formik.values.authGroups)}
              parentItemName="cluster link"
              selectedGroups={new Set(formik.values.authGroups)}
              setSelectedGroups={(val, isUnselectAll) => {
                if (isUnselectAll) {
                  formik.setFieldValue("authGroups", []);
                } else {
                  formik.setFieldValue("authGroups", val);
                }
              }}
              toggleGroup={(group) => {
                const currentGroups = formik.values.authGroups;
                if (currentGroups.includes(group)) {
                  formik.setFieldValue(
                    "authGroups",
                    currentGroups.filter((g) => g !== group),
                  );
                } else {
                  formik.setFieldValue("authGroups", [...currentGroups, group]);
                }
              }}
              scrollDependencies={[formik]}
            />
          </Form>
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
