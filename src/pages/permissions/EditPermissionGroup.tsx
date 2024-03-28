import { FC } from "react";
import { ActionButton, Button, useNotify } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { queryKeys } from "util/queryKeys";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";
import { LxdGroup } from "types/permissions";
import PermissionGroupForm, {
  PermissionGroupFormValues,
  permissionGroupFormToPayload,
} from "./forms/PermissionGroupForm";
import { fetchPermissionGroup, updatePermissionGroup } from "api/permissions";
import { getPermissionGroupEditValues } from "util/permissionGroupEdit";
import { MAIN_CONFIGURATION } from "./forms/PermissionGroupFormMenu";

interface Props {
  group: LxdGroup;
}

const EditPermissionGroup: FC<Props> = ({ group }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();

  const formik = useFormik<PermissionGroupFormValues>({
    initialValues: getPermissionGroupEditValues(group),
    onSubmit: (values) => {
      const currentGroup = permissionGroupFormToPayload(values);
      updatePermissionGroup(currentGroup)
        .then(async () => {
          toastNotify.success(`Permission group ${group.name} updated.`);
          const udpatedGroup = await fetchPermissionGroup(values.name);
          void formik.setValues(getPermissionGroupEditValues(udpatedGroup));
        })
        .catch((e) => {
          notify.failure("Permission group update failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.permissionGroups],
          });
        });
    },
  });

  return (
    <div className="edit-permission-group">
      <PermissionGroupForm formik={formik} section={MAIN_CONFIGURATION} />
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
                formik.setValues(getPermissionGroupEditValues(group))
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

export default EditPermissionGroup;
