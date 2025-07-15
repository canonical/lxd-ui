import {
  ActionButton,
  Button,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import SidePanel from "components/SidePanel";
import type { FC } from "react";
import { useState } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import type { GroupFormValues } from "../forms/GroupForm";
import GroupForm from "../forms/GroupForm";
import { createGroup } from "api/auth-groups";
import { queryKeys } from "util/queryKeys";
import { testDuplicateGroupName } from "util/permissionGroups";
import NotificationRow from "components/NotificationRow";
import ScrollableContainer from "components/ScrollableContainer";
import type { FormIdentity } from "pages/permissions/panels/EditIdentitiesForm";
import EditIdentitiesForm from "pages/permissions/panels/EditIdentitiesForm";
import classnames from "classnames";
import { updateIdentities } from "api/auth-identities";
import type { FormPermission } from "pages/permissions/panels/EditGroupPermissionsForm";
import EditGroupPermissionsForm from "pages/permissions/panels/EditGroupPermissionsForm";
import GroupHeaderTitle from "pages/permissions/panels/GroupHeaderTitle";
import ResourceLink from "components/ResourceLink";

export type GroupSubForm = "identity" | "permission" | null;

const CreateGroupPanel: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [identities, setIdentities] = useState<FormIdentity[]>([]);
  const [permissions, setPermissions] = useState<FormPermission[]>([]);

  const subForm = panelParams.subForm;
  const setSubForm = (newSubForm: GroupSubForm) => {
    panelParams.openCreateGroup(newSubForm);
  };

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const groupSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicateGroupName(controllerState))
      .required("Group name is required"),
  });

  const handleSuccess = (groupName: string) => {
    toastNotify.success(
      <>
        Group{" "}
        <ResourceLink
          type="auth-group"
          value={groupName}
          to="/ui/permissions/groups"
        />{" "}
        created.
      </>,
    );
    closePanel();
  };

  const addIdentitiesToGroup = (groupName: string) => {
    if (identities.length === 0) {
      handleSuccess(groupName);
      return;
    }

    const identitiesWithGroup = identities.map((identity) => {
      const oldGroups = identity.groups || [];
      identity.groups = [...oldGroups, groupName];
      return identity;
    });

    updateIdentities(identitiesWithGroup)
      .then(() => {
        handleSuccess(groupName);
      })
      .catch((e) => {
        notify.failure(
          `Group ${groupName} created, failed to add identities.`,
          e,
        );
      })
      .finally(() => {
        formik.setSubmitting(false);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.authGroups],
        });
      });
  };

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
        permissions: permissions.filter((p) => !p.isRemoved),
      })
        .then(() => {
          addIdentitiesToGroup(values.name);
        })
        .catch((e) => {
          notify.failure(`Group creation failed`, e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          queryClient.invalidateQueries({
            queryKey: [queryKeys.authGroups],
          });
        });
    },
  });

  return (
    <>
      <SidePanel
        isOverlay
        loading={false}
        hasError={false}
        className={classnames({
          "edit-permissions-panel": subForm === "permission",
        })}
      >
        <SidePanel.Header>
          <SidePanel.HeaderTitle key={subForm ?? "start"}>
            <GroupHeaderTitle subForm={subForm} setSubForm={setSubForm} />
          </SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[notify.notification, subForm]}
            belowIds={["panel-footer"]}
          >
            {subForm === null && (
              <GroupForm
                formik={formik}
                setSubForm={setSubForm}
                identityCount={identities.length}
                identityModifyCount={identities.length}
                permissionCount={permissions.length}
                permissionModifyCount={permissions.length}
                isEditing={false}
              />
            )}
            {subForm === "identity" && (
              <EditIdentitiesForm
                selected={identities}
                setSelected={setIdentities}
                groupName={formik.values.name}
              />
            )}
            {subForm === "permission" && (
              <EditGroupPermissionsForm
                permissions={permissions}
                setPermissions={setPermissions}
              />
            )}
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
    </>
  );
};

export default CreateGroupPanel;
