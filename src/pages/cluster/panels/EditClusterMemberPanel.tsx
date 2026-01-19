import {
  ActionButton,
  Button,
  Form,
  Input,
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
import { updateClusterMember } from "api/cluster-members";
import { useClusterMember } from "context/useClusterMembers";
import type { LxdClusterMember } from "types/cluster";
import GroupSelection from "pages/permissions/panels/GroupSelection";
import { useClusterGroups } from "context/useClusterGroups";
import ClusterMemberRichChip from "../ClusterMemberRichChip";

export interface EditClusterMemberForm {
  name: string;
  description: string;
  failureDomain: string;
  groups: string[];
}

interface Props {
  onClose?: () => void;
}

const EditClusterMemberPanel: FC<Props> = ({ onClose }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { data: member } = useClusterMember(panelParams.member ?? "");
  const { data: clusterGroups = [] } = useClusterGroups();

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
    onClose?.();
  };

  const formik = useFormik<EditClusterMemberForm>({
    initialValues: {
      name: member?.server_name ?? "",
      description: member?.description ?? "",
      failureDomain: member?.failure_domain ?? "",
      groups: member?.groups ?? [],
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      const payload = {
        server_name: values.name,
        description: values.description,
        failure_domain: values.failureDomain,
        groups: values.groups,
        roles: member?.roles,
      } as LxdClusterMember;

      updateClusterMember(payload)
        .then(() => {
          toastNotify.success(
            <>
              Cluster member{" "}
              <ClusterMemberRichChip clusterMember={values.name} /> saved.
            </>,
          );
          closePanel();
        })
        .catch((e) => {
          notify.failure("Cluster member update failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          queryClient.invalidateQueries({
            queryKey: [queryKeys.cluster, queryKeys.members],
          });
          queryClient.invalidateQueries({
            queryKey: [queryKeys.cluster, queryKeys.members, values.name],
          });
        });
    },
  });

  const addedGroups = formik.values.groups.filter(
    (group) => !member?.groups?.includes(group) || false,
  );
  const removedGroups =
    member?.groups?.filter((group) => !formik.values.groups.includes(group)) ??
    [];
  const modifiedGroups = new Set([...addedGroups, ...removedGroups]);

  return (
    <SidePanel>
      <SidePanel.Header>
        <SidePanel.HeaderTitle>
          Edit cluster member {panelParams.member}
        </SidePanel.HeaderTitle>
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
            <Input
              {...formik.getFieldProps("failureDomain")}
              type="text"
              label="Failure domain"
              placeholder="Enter failure domain"
            />
            <p className="u-sv-1">Cluster groups</p>
            <GroupSelection
              groups={clusterGroups}
              modifiedGroups={modifiedGroups}
              parentItemName="member"
              parentItems={[{ name: formik.values.name }]}
              selectedGroups={new Set(formik.values.groups)}
              setSelectedGroups={(val, isUnselectAll) => {
                if (isUnselectAll) {
                  formik.setFieldValue("groups", []);
                } else {
                  formik.setFieldValue("groups", val);
                }
              }}
              preselectedGroups={new Set(member?.groups ?? [])}
              indeterminateGroups={new Set()}
              toggleGroup={(group) => {
                const newGroups = new Set([...formik.values.groups]);
                if (newGroups.has(group)) {
                  newGroups.delete(group);
                } else {
                  newGroups.add(group);
                }
                formik.setFieldValue("groups", [...newGroups]);
              }}
              scrollDependencies={[notify.notification]}
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
          disabled={
            !formik.isValid || formik.isSubmitting || !formik.values.name
          }
        >
          Save changes
        </ActionButton>
      </SidePanel.Footer>
    </SidePanel>
  );
};

export default EditClusterMemberPanel;
