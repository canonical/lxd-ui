import {
  ActionButton,
  Button,
  SidePanel,
  useNotify,
} from "@canonical/react-components";
import type { FC } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import type { TLSIdentityFormValues } from "../forms/NameWithGroupForm";
import GroupSelection from "./GroupSelection";
import useEditHistory from "util/useEditHistory";
import { useAuthGroups } from "context/useAuthGroups";
import { createFineGrainedTlsIdentity } from "api/auth-identities";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { base64EncodeObject } from "util/helpers";
import NameWithGroupForm from "../forms/NameWithGroupForm";

interface GroupEditHistory {
  groupsAdded: Set<string>;
}

interface Props {
  onSuccess: (identityName: string, token: string) => void;
}

const CreateTLSIdentityPanel: FC<Props> = ({ onSuccess }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const queryClient = useQueryClient();

  const { data: groups = [], error, isLoading } = useAuthGroups();

  const { desiredState, save: saveToPanelHistory } =
    useEditHistory<GroupEditHistory>({
      initialState: {
        groupsAdded: new Set(),
      },
    });

  if (error) {
    notify.failure("Loading panel details failed", error);
  }

  const modifyGroups = (newGroups: string[], isUnselectAll?: boolean) => {
    if (isUnselectAll) {
      saveToPanelHistory({
        groupsAdded: new Set(),
      });
    } else {
      saveToPanelHistory({
        groupsAdded: new Set(newGroups),
      });
    }
  };

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const handleSubmit = (values: TLSIdentityFormValues) => {
    createFineGrainedTlsIdentity(
      values.name,
      Array.from(desiredState.groupsAdded),
    )
      .then((response) => {
        const encodedToken = base64EncodeObject(response);
        onSuccess(values.name, encodedToken);

        queryClient.invalidateQueries({
          queryKey: [queryKeys.identities],
        });
        closePanel();
      })
      .catch((e) => {
        notify.failure("TLS Identity failed to be created", e);
      });
  };

  const groupSchema = Yup.object().shape({
    name: Yup.string().required("Identity name is required"),
  });

  const formik = useFormik<TLSIdentityFormValues>({
    initialValues: {
      name: "",
      groups: [],
    },
    validationSchema: groupSchema,
    onSubmit: handleSubmit,
  });

  return (
    <>
      <SidePanel loading={isLoading} hasError={!groups}>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>Create identity</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <NameWithGroupForm formik={formik} />
        <p>Auth groups</p>
        <SidePanel.Content className="u-no-padding">
          <GroupSelection
            groups={groups}
            modifiedGroups={desiredState.groupsAdded}
            parentItemName=""
            selectedGroups={desiredState.groupsAdded}
            setSelectedGroups={modifyGroups}
            toggleGroup={(group: string) => {
              const newGroups = new Set([...desiredState.groupsAdded]);
              if (newGroups.has(group)) {
                newGroups.delete(group);
              } else {
                newGroups.add(group);
              }
              modifyGroups([...newGroups], newGroups.size === 0);
            }}
            scrollDependencies={[
              groups,
              desiredState.groupsAdded.size,
              notify.notification,
              formik,
            ]}
          />
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
            onClick={() => void formik.submitForm()}
            className="u-no-margin--bottom"
            disabled={
              !formik.isValid || formik.isSubmitting || !formik.values.name
            }
            loading={formik.isSubmitting}
          >
            Create identity
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};

export default CreateTLSIdentityPanel;
