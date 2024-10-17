import { useNotify } from "@canonical/react-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SidePanel from "components/SidePanel";
import { FC, useState } from "react";
import usePanelParams from "util/usePanelParams";
import { useToastNotification } from "context/toastNotificationProvider";
import * as Yup from "yup";
import { useFormik } from "formik";
import { queryKeys } from "util/queryKeys";
import NotificationRow from "components/NotificationRow";
import { IdpGroup } from "types/permissions";
import { renameIdpGroup, updateIdpGroup } from "api/auth-idp-groups";
import { testDuplicateIdpGroupName } from "util/permissionIdpGroups";
import { fetchGroups } from "api/auth-groups";
import useEditHistory from "util/useEditHistory";
import IdpGroupForm, { IdpGroupFormValues } from "../forms/IdpGroupForm";
import GroupSelection from "./GroupSelection";
import GroupSelectionActions from "../actions/GroupSelectionActions";
import ResourceLink from "components/ResourceLink";

type GroupEditHistory = {
  groupsAdded: Set<string>;
  groupsRemoved: Set<string>;
};

interface Props {
  idpGroup: IdpGroup;
  onClose?: () => void;
}

const EditIdpGroupPanel: FC<Props> = ({ idpGroup, onClose }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const {
    data: groups = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.authGroups],
    queryFn: fetchGroups,
  });

  const {
    desiredState,
    save: saveToPanelHistory,
    undo: undoMappingChanges,
  } = useEditHistory<GroupEditHistory>({
    initialState: {
      groupsAdded: new Set(),
      groupsRemoved: new Set(),
    },
  });

  if (error) {
    notify.failure("Loading panel details failed", error);
  }

  const selectedGroups = new Set<string>(desiredState.groupsAdded);
  for (const group of idpGroup.groups) {
    if (!desiredState.groupsRemoved.has(group)) {
      selectedGroups.add(group);
    }
  }

  const calculateModifiedGroups = () => {
    const modifiedGroups = new Set<string>();

    for (const group of idpGroup.groups) {
      if (!selectedGroups.has(group)) {
        modifiedGroups.add(group);
      }
    }

    for (const group of groups) {
      if (
        !idpGroup.groups.includes(group.name) &&
        selectedGroups.has(group.name)
      ) {
        modifiedGroups.add(group.name);
      }
    }

    return modifiedGroups;
  };

  const modifyGroups = (newGroups: string[], isUnselectAll?: boolean) => {
    if (isUnselectAll) {
      saveToPanelHistory({
        groupsAdded: new Set(),
        groupsRemoved: new Set(groups.map((group) => group.name)),
      });
    } else {
      saveToPanelHistory({
        groupsAdded: new Set(newGroups),
        groupsRemoved: new Set(),
      });
    }
  };

  const toggleRow = (rowName: string) => {
    const isRowSelected = selectedGroups.has(rowName);

    const groupsAdded = new Set(desiredState.groupsAdded);
    const groupsRemoved = new Set(desiredState.groupsRemoved);

    if (isRowSelected) {
      groupsAdded.delete(rowName);
      groupsRemoved.add(rowName);
    } else {
      groupsAdded.add(rowName);
      groupsRemoved.delete(rowName);
    }

    saveToPanelHistory({
      groupsAdded,
      groupsRemoved,
    });
  };

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
    onClose?.();
  };

  const saveIdpGroup = (values: IdpGroupFormValues) => {
    const newGroupMappings = new Set(idpGroup.groups);
    for (const group of desiredState.groupsAdded) {
      newGroupMappings.add(group);
    }

    for (const group of desiredState.groupsRemoved) {
      newGroupMappings.delete(group);
    }

    let mutationPromise = updateIdpGroup({
      ...idpGroup,
      groups: Array.from(newGroupMappings),
    });

    const nameChanged = idpGroup.name !== values.name;

    if (nameChanged) {
      mutationPromise = mutationPromise.then(() =>
        renameIdpGroup(idpGroup?.name ?? "", values.name),
      );
    }

    formik.setSubmitting(true);
    mutationPromise
      .then(() => {
        toastNotify.success(
          <>
            IDP group{" "}
            <ResourceLink
              type="idp-group"
              value={values.name}
              to="/ui/permissions/idp-groups"
            />{" "}
            updated.
          </>,
        );
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.idpGroups],
        });
        closePanel();
      })
      .catch((e) => {
        notify.failure(`IDP group update failed`, e);
      })
      .finally(() => {
        formik.setSubmitting(false);
      });
  };

  const groupSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        ...testDuplicateIdpGroupName(
          controllerState,
          panelParams.idpGroup ?? "",
        ),
      )
      .required("IDP group name is required"),
  });

  const formik = useFormik<IdpGroupFormValues>({
    initialValues: {
      name: idpGroup?.name ?? "",
    },
    enableReinitialize: true,
    validationSchema: groupSchema,
    onSubmit: saveIdpGroup,
  });

  const modifiedGroups = calculateModifiedGroups();
  const nameModified = !!formik.touched.name;
  const nameIsValid = formik.isValid && formik.values.name;
  const groupsModified = !!modifiedGroups.size;
  const enableSubmission =
    (nameModified && nameIsValid) || (nameIsValid && groupsModified);

  return (
    <>
      <SidePanel
        isOverlay
        loading={isLoading}
        hasError={!groups}
        onClose={onClose}
      >
        <SidePanel.Header>
          <SidePanel.HeaderTitle>{`Edit IDP group ${idpGroup?.name}`}</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <IdpGroupForm formik={formik} />
        <p>Map groups to this idp group</p>
        <SidePanel.Content className="u-no-padding">
          <GroupSelection
            groups={groups}
            modifiedGroups={modifiedGroups}
            parentItemName="IDP group"
            parentItems={[idpGroup]}
            selectedGroups={selectedGroups}
            setSelectedGroups={modifyGroups}
            toggleGroup={toggleRow}
            scrollDependencies={[
              groups,
              modifiedGroups.size,
              notify.notification,
              formik,
            ]}
          />
        </SidePanel.Content>
        <SidePanel.Footer className="u-align--right">
          <GroupSelectionActions
            modifiedGroups={modifiedGroups}
            undoChange={undoMappingChanges}
            closePanel={closePanel}
            onSubmit={() => void formik.submitForm()}
            loading={formik.isSubmitting}
            disabled={!enableSubmission}
          />
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};

export default EditIdpGroupPanel;
