import { FC } from "react";
import { ActionButton, Button, useNotify } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { queryKeys } from "util/queryKeys";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";
import { IdpGroup } from "types/permissions";
import { fetchIdpGroup, updateIdpGroup } from "api/permissions";
import { getIdentityProviderGroupEditValues } from "util/permissionGroupEdit";
import { MAIN_CONFIGURATION } from "./forms/PermissionGroupFormMenu";
import IdentityProviderGroupForm, {
  IdentityProviderGroupFormValues,
} from "./forms/IdentityProviderGroupForm";

interface Props {
  group: IdpGroup;
}

const EditIdentityProviderGroup: FC<Props> = ({ group }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();

  const formik = useFormik<IdentityProviderGroupFormValues>({
    initialValues: getIdentityProviderGroupEditValues(group),
    onSubmit: (values) => {
      const currentGroup = {
        name: values.name,
        groups: values.groups,
      };
      updateIdpGroup(currentGroup)
        .then(async () => {
          toastNotify.success(`IDP group ${group.name} updated.`);
          const udpatedGroup = await fetchIdpGroup(values.name);
          void formik.setValues(
            getIdentityProviderGroupEditValues(udpatedGroup),
          );
        })
        .catch((e) => {
          notify.failure("IDP group update failed", e);
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
    <div className="edit-permission-group">
      <IdentityProviderGroupForm
        formik={formik}
        section={MAIN_CONFIGURATION}
        idpGroup={group}
      />
      <FormFooterLayout>
        {formik.values.readOnly ? (
          <Button
            appearance="positive"
            onClick={() => void formik.setFieldValue("readOnly", false)}
          >
            Edit group
          </Button>
        ) : (
          <>
            <Button
              appearance="base"
              onClick={() =>
                formik.setValues(getIdentityProviderGroupEditValues(group))
              }
            >
              Cancel
            </Button>
            <ActionButton
              appearance="positive"
              loading={formik.isSubmitting}
              disabled={!formik.isValid}
              onClick={() => void formik.submitForm()}
            >
              Save changes
            </ActionButton>
          </>
        )}
      </FormFooterLayout>
    </div>
  );
};

export default EditIdentityProviderGroup;
