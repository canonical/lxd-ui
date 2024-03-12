import { ActionButton, Button, useNotify } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import SidePanel from "components/SidePanel";
import { FC, useState } from "react";
import usePanelParams from "util/usePanelParams";
import { useToastNotification } from "context/toastNotificationProvider";
import * as Yup from "yup";
import { useFormik } from "formik";
import GroupForm, { GroupFormValues } from "../forms/GroupForm";
import { renameGroup, updateGroup } from "api/auth-groups";
import { queryKeys } from "util/queryKeys";
import { testDuplicateGroupName } from "util/permissionGroups";
import NotificationRow from "components/NotificationRow";
import { LxdGroup } from "types/permissions";
import ScrollableContainer from "components/ScrollableContainer";

interface Props {
  group: LxdGroup;
}

const EditGroupPanel: FC<Props> = ({ group }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const groupSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicateGroupName(controllerState, panelParams.group ?? ""))
      .required("Group name is required"),
  });

  const formik = useFormik<GroupFormValues>({
    initialValues: {
      name: group?.name ?? "",
      description: group?.description ?? "",
    },
    enableReinitialize: true,
    validationSchema: groupSchema,
    onSubmit: (values) => {
      const isNameChanged = values.name !== group?.name;
      const mutationPromise = isNameChanged
        ? renameGroup(group?.name ?? "", values.name).then(() =>
            updateGroup({
              ...group,
              name: values.name,
              description: values.description,
            }),
          )
        : updateGroup({
            ...group,
            name: values.name,
            description: values.description,
          });

      mutationPromise
        .then(() => {
          panelParams.clear();
          toastNotify.success(`LXD group ${values.name} updated.`);
          notify.clear();
        })
        .catch((e) => {
          notify.failure(`LXD group update failed`, e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.authGroups],
          });
        });
    },
  });

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  return (
    <>
      <SidePanel isOverlay loading={false} hasError={false}>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>{`Edit group ${group?.name}`}</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="panel-notification" />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[notify.notification]}
            belowIds={["panel-footer"]}
          >
            <GroupForm formik={formik} />
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
            disabled={!formik.isValid || !formik.values.name}
          >
            Confirm
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};

export default EditGroupPanel;
