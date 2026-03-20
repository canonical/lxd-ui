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
import type { TLSIdentityFormValues } from "types/forms/tlsIdentity";
import GroupSelection from "./GroupSelection";
import { useAuthGroups } from "context/useAuthGroups";
import { createFineGrainedTlsIdentity } from "api/auth-identities";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { base64EncodeObject } from "util/helpers";
import NameWithGroupForm from "../forms/NameWithGroupForm";
import { useIdentities } from "context/useIdentities";

interface Props {
  onSuccess: (identityName: string, token: string) => void;
}

const CreateTLSIdentityPanel: FC<Props> = ({ onSuccess }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const queryClient = useQueryClient();

  const { data: groups = [], error, isLoading } = useAuthGroups();
  const { data: identities = [] } = useIdentities();

  if (error) {
    notify.failure("Loading panel details failed", error);
  }

  const modifyGroups = (newGroups: string[], isUnselectAll?: boolean) => {
    if (isUnselectAll) {
      formik.setFieldValue("groups", []);
    } else {
      formik.setFieldValue("groups", newGroups);
    }
  };

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const handleSubmit = (values: TLSIdentityFormValues) => {
    createFineGrainedTlsIdentity(values.name, values.groups ?? [])
      .then((response) => {
        const encodedToken = base64EncodeObject(response);
        onSuccess(values.name, encodedToken);

        queryClient.invalidateQueries({
          queryKey: [queryKeys.identities],
        });
        closePanel();
      })
      .catch((e) => {
        formik.setSubmitting(false);
        notify.failure("Identity creation failed", e);
      });
  };

  const groupSchema = Yup.object().shape({
    name: Yup.string()
      .required("Identity name is required")
      .test(
        "unique-name",
        "An identity with this name already exists",
        function (value) {
          if (!value) {
            return true;
          }
          const existingNames = identities.map((identity) => identity.name);
          return !existingNames.includes(value);
        },
      ),
  });

  const formik = useFormik<TLSIdentityFormValues>({
    initialValues: {
      name: "",
      groups: [],
    },
    validationSchema: groupSchema,
    onSubmit: handleSubmit,
  });

  const groupsAdded = new Set(formik.values.groups ?? []);

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
            modifiedGroups={groupsAdded}
            parentItemName=""
            selectedGroups={groupsAdded}
            setSelectedGroups={modifyGroups}
            toggleGroup={(group: string) => {
              if (groupsAdded.has(group)) {
                groupsAdded.delete(group);
              } else {
                groupsAdded.add(group);
              }
              formik.setFieldValue("groups", Array.from(groupsAdded));
            }}
            scrollDependencies={[
              groups,
              groupsAdded.size,
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
