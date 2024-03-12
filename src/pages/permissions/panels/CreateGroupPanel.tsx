import { ActionButton, Button, useNotify } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import SidePanel from "components/SidePanel";
import { FC, useState } from "react";
import usePanelParams from "util/usePanelParams";
import { useToastNotification } from "context/toastNotificationProvider";
import * as Yup from "yup";
import { useFormik } from "formik";
import GroupForm, { GroupFormValues } from "../forms/GroupForm";
import { createGroup } from "api/auth-groups";
import { queryKeys } from "util/queryKeys";
import { testDuplicateGroupName } from "util/permissionGroups";
import NotificationRow from "components/NotificationRow";
import ScrollableContainer from "components/ScrollableContainer";

const CreateGroupPanel: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const groupSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicateGroupName(controllerState))
      .required("Group name is required"),
  });

  const formik = useFormik<GroupFormValues>({
    initialValues: {
      name: "",
      description: "",
    },
    validationSchema: groupSchema,
    onSubmit: (values) => {
      createGroup({
        name: values.name,
        description: values.description,
      })
        .then(() => {
          toastNotify.success(`Group ${values.name} created.`);
          closePanel();
        })
        .catch((e) => {
          notify.failure(`Group creation failed`, e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.authGroups],
          });
        });
    },
  });

  return (
    <>
      <SidePanel isOverlay loading={false} hasError={false}>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>Create group</SidePanel.HeaderTitle>
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
            Create group
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};

export default CreateGroupPanel;
