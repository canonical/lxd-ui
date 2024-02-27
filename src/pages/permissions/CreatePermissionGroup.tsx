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
import PermissionGroupForm, {
  PermissionGroupFormValues,
  permissionGroupFormToPayload,
} from "./forms/PermissionGroupForm";
import { createPermissionGroup } from "api/permissions";
import { MAIN_CONFIGURATION } from "./forms/PermissionGroupFormMenu";

const CreatePermissionGroup: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const CreatePermissionGroupSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicatePermissionGroupName(controllerState))
      .required("This field is required"),
  });

  const formik = useFormik<PermissionGroupFormValues>({
    initialValues: {
      isCreating: true,
      readOnly: false,
      name: "",
      description: "",
      permissions: [],
    },
    validationSchema: CreatePermissionGroupSchema,
    onSubmit: (values) => {
      const group = permissionGroupFormToPayload(values);
      createPermissionGroup(group)
        .then(() => {
          navigate(`/ui/permissions/lxd-groups`);
          toastNotify.success(`Permission group ${group.name} created.`);
        })
        .catch((e) => {
          notify.failure("Permission group creation failed", e);
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
    <BaseLayout
      title="Create a permission group"
      contentClassName="create-permission-group"
    >
      <NotificationRow />
      <PermissionGroupForm formik={formik} section={MAIN_CONFIGURATION} />
      <FormFooterLayout>
        <Button
          appearance="base"
          onClick={() => navigate(`/ui/permissions/lxd-groups`)}
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

export default CreatePermissionGroup;
