import {
  ActionButton,
  Button,
  ConfirmationModal,
  useNotify,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import SidePanel from "components/SidePanel";
import type { FC } from "react";
import { useEffect, useState } from "react";
import usePanelParams from "util/usePanelParams";
import { useToastNotification } from "context/toastNotificationProvider";
import * as Yup from "yup";
import { useFormik } from "formik";
import type { GroupFormValues } from "../forms/GroupForm";
import GroupForm from "../forms/GroupForm";
import { renameGroup, updateGroup } from "api/auth-groups";
import { queryKeys } from "util/queryKeys";
import { testDuplicateGroupName } from "util/permissionGroups";
import NotificationRow from "components/NotificationRow";
import type { LxdGroup, LxdIdentity } from "types/permissions";
import ScrollableContainer from "components/ScrollableContainer";
import classnames from "classnames";
import type { FormIdentity } from "pages/permissions/panels/EditIdentitiesForm";
import EditIdentitiesForm from "pages/permissions/panels/EditIdentitiesForm";
import { getIdentityIdsForGroup } from "util/permissionIdentities";
import type { FormPermission } from "pages/permissions/panels/EditGroupPermissionsForm";
import EditGroupPermissionsForm from "pages/permissions/panels/EditGroupPermissionsForm";
import {
  getIdentityNameLookup,
  getImageLookup,
  getPermissionId,
  getResourceLabel,
} from "util/permissions";
import { updateIdentities } from "api/auth-identities";
import LoggedInUserNotification from "pages/permissions/panels/LoggedInUserNotification";
import { useSettings } from "context/useSettings";
import { pluralize } from "util/instanceBulkActions";
import GroupHeaderTitle from "pages/permissions/panels/GroupHeaderTitle";
import type { GroupSubForm } from "pages/permissions/panels/CreateGroupPanel";
import ResourceLink from "components/ResourceLink";
import { useImagesInAllProjects } from "context/useImages";
import { useIdentities } from "context/useIdentities";
import { useGroupEntitlements } from "util/entitlements/groups";

interface Props {
  group: LxdGroup;
  onClose?: () => void;
}

const EditGroupPanel: FC<Props> = ({ group, onClose }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [subForm, setSubForm] = useState<GroupSubForm>(panelParams.subForm);
  const [confirming, setConfirming] = useState(false);
  const [identities, setIdentities] = useState<FormIdentity[]>(
    getIdentityIdsForGroup(group).map((id) => ({ id: id })) as FormIdentity[],
  );
  const [permissions, setPermissions] = useState<FormPermission[]>(
    (group.permissions ?? []) as FormPermission[],
  );
  const { data: settings } = useSettings();
  const loggedInIdentityID = settings?.auth_user_name ?? "";
  const { canEditGroup } = useGroupEntitlements();

  // We initialize the identities state with id only,
  // to get the correct counts on initial render.
  // enrich identities with the rest of the data now
  const {
    data: lxdIdentities = [],
    isLoading: lxdIdentityLoading,
    isError: lxdIdentitiesError,
  } = useIdentities();
  useEffect(() => {
    if (!lxdIdentityLoading && !lxdIdentitiesError) {
      const groupIds = new Set(getIdentityIdsForGroup(group));
      const enrichedIdentities = lxdIdentities.filter((i) =>
        groupIds.has(i.id),
      );
      setIdentities(enrichedIdentities);
    }
  }, [lxdIdentityLoading, lxdIdentitiesError, lxdIdentities, group]);

  // We initialize the permissions as LxdPermission from the group,
  // enrich permissions with id and resource label to be FormPermissions
  const {
    data: images = [],
    isLoading: imageLoading,
    isError: imageError,
  } = useImagesInAllProjects();
  useEffect(() => {
    if (
      !lxdIdentityLoading &&
      !lxdIdentitiesError &&
      !imageLoading &&
      !imageError
    ) {
      const imageLookup = getImageLookup(images);
      const identityNameLookup = getIdentityNameLookup(lxdIdentities);
      const enrichedPermissions: FormPermission[] = (
        group.permissions ?? []
      ).map((permission) => {
        const id = getPermissionId(permission);
        const resourceLabel = getResourceLabel(
          permission,
          imageLookup,
          identityNameLookup,
        );
        return { ...permission, resourceLabel, id };
      });
      setPermissions(enrichedPermissions);
    }
  }, [
    lxdIdentityLoading,
    lxdIdentitiesError,
    imageLoading,
    imageError,
    lxdIdentities,
    images,
    group,
  ]);

  const groupSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicateGroupName(controllerState, panelParams.group ?? ""))
      .required("Group name is required"),
  });

  const saveIdentities = async () => {
    const added = identities.filter((id) => id.isAdded);
    const removed = identities.filter((id) => id.isRemoved);

    if (added.length === 0 && removed.length === 0) {
      return;
    }

    const identityPayload: LxdIdentity[] = [];

    added.map((identity) => {
      identityPayload.push({
        ...identity,
        groups: [...(identity.groups || []), formik.values.name],
      });
    });

    removed.map((identity) => {
      identityPayload.push({
        ...identity,
        groups: [
          ...(identity.groups || []).filter((g) => g !== formik.values.name),
        ],
      });
    });

    return updateIdentities(identityPayload);
  };

  const saveGroup = (values: GroupFormValues) => {
    const isNameChanged = values.name !== group?.name;
    const groupPayload = {
      ...group,
      name: values.name,
      description: values.description,
      permissions: permissions.filter((p) => !p.isRemoved),
    };

    const mutation = async () => {
      if (!canEditGroup(group)) {
        return saveIdentities();
      }

      return isNameChanged
        ? renameGroup(group?.name ?? "", values.name)
            .then(async () => updateGroup(groupPayload))
            .then(saveIdentities)
        : updateGroup(groupPayload).then(saveIdentities);
    };

    mutation()
      .then(() => {
        closePanel();
        toastNotify.success(
          <>
            Group{" "}
            <ResourceLink
              type="auth-group"
              value={values.name}
              to="/ui/permissions/groups"
            />{" "}
            updated.
          </>,
        );
      })
      .catch((e) => {
        notify.failure("Group update failed", e);
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
      name: group?.name ?? "",
      description: group?.description ?? "",
    },
    enableReinitialize: true,
    validationSchema: groupSchema,
    onSubmit: (values) => {
      const isSelfInGroup =
        getIdentityIdsForGroup(group).includes(loggedInIdentityID);
      const isSelfRemoved = identities.find(
        (identity) => identity.id === loggedInIdentityID,
      )?.isRemoved;
      const isPermissionRemoved = permissions.find((p) => p.isRemoved);
      if (isSelfRemoved || (isSelfInGroup && isPermissionRemoved)) {
        setConfirming(true);
      } else {
        saveGroup(values);
      }
    },
  });

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
    onClose?.();
  };

  const changeCount =
    identities.filter((i) => i.isAdded || i.isRemoved).length +
    permissions.filter((p) => p.isAdded || p.isRemoved).length +
    (formik.values.name !== group.name ? 1 : 0) +
    (formik.values.description !== group.description ? 1 : 0);

  return (
    <>
      <SidePanel
        isOverlay
        loading={false}
        hasError={false}
        className={classnames({
          "edit-permissions-panel": subForm === "permission",
        })}
        onClose={closePanel}
      >
        <SidePanel.Header>
          <SidePanel.HeaderTitle key={subForm ?? "start"}>
            <GroupHeaderTitle
              subForm={subForm}
              setSubForm={setSubForm}
              group={group}
            />
          </SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          {subForm === null && (
            <ScrollableContainer
              dependencies={[notify.notification, subForm]}
              belowIds={["panel-footer"]}
            >
              <GroupForm
                formik={formik}
                setSubForm={setSubForm}
                identityCount={identities.filter((i) => !i.isRemoved).length}
                identityModifyCount={
                  identities.filter((i) => i.isAdded || i.isRemoved).length
                }
                permissionCount={permissions.filter((p) => !p.isRemoved).length}
                permissionModifyCount={
                  permissions.filter((p) => p.isAdded || p.isRemoved).length
                }
                group={group}
              />
            </ScrollableContainer>
          )}
          {subForm === "identity" && (
            <EditIdentitiesForm
              selected={identities}
              setSelected={setIdentities}
              groupName={group.name}
            />
          )}
          {subForm === "permission" && (
            <EditGroupPermissionsForm
              permissions={permissions}
              setPermissions={setPermissions}
              group={group}
            />
          )}
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
              !formik.isValid ||
              formik.isSubmitting ||
              !formik.values.name ||
              changeCount === 0
            }
          >
            {changeCount === 0
              ? "Save changes"
              : `Save ${changeCount} ${pluralize("change", changeCount)}`}
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
      {confirming && (
        <ConfirmationModal
          confirmButtonLabel="Confirm changes"
          confirmButtonAppearance="positive"
          onConfirm={() => {
            saveGroup(formik.values);
          }}
          close={() => {
            setConfirming(false);
            formik.setSubmitting(false);
          }}
          title="Confirm permission modification"
          className="permission-confirm-modal"
        >
          <LoggedInUserNotification isVisible />
        </ConfirmationModal>
      )}
    </>
  );
};

export default EditGroupPanel;
