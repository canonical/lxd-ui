import { FC, useState } from "react";
import { useNotify, Button, ActionButton } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import BaseLayout from "components/BaseLayout";
import NotificationRow from "components/NotificationRow";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { queryKeys } from "util/queryKeys";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";
import { testDuplicatePermissionGroupName } from "util/permissions";
import { MAIN_CONFIGURATION } from "./forms/PermissionGroupFormMenu";
import IdentityProviderGroupForm, {
  IdentityProviderGroupFormValues,
} from "./forms/IdentityProviderGroupForm";
import { createIdpGroup } from "api/permissions";

const CreateIdentityProviderGroup: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const groupType = "idp-groups";
  const CreatePermissionGroupSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicatePermissionGroupName(controllerState, groupType))
      .required("This field is required"),
  });

  const formik = useFormik<IdentityProviderGroupFormValues>({
    initialValues: {
      isCreating: true,
      readOnly: false,
      name: "",
      groups: [],
    },
    validationSchema: CreatePermissionGroupSchema,
    onSubmit: (values) => {
      const group = {
        name: values.name,
        groups: values.groups,
      };
      createIdpGroup(group)
        .then(() => {
          navigate(`/ui/permissions/idp-groups`);
          toastNotify.success(`IDP group ${group.name} created.`);
        })
        .catch((e) => {
          notify.failure("IDP group creation failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.idpGroups],
          });
        });
    },
  });

  return (
    <BaseLayout
      title="Create an IDP group"
      contentClassName="create-permission-group"
    >
      <NotificationRow />
      <IdentityProviderGroupForm
        formik={formik}
        section={MAIN_CONFIGURATION}
        idpGroup={{ groups: [] }}
      />
      <FormFooterLayout>
        <Button
          appearance="base"
          onClick={() => navigate(`/ui/permissions/idp-groups`)}
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          disabled={!formik.isValid || !formik.values.name}
          onClick={() => void formik.submitForm()}
        >
          Create
        </ActionButton>
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateIdentityProviderGroup;
