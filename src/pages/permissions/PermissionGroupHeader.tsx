import { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RenameHeader, { RenameHeaderValues } from "components/RenameHeader";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNotify } from "@canonical/react-components";
import { useToastNotification } from "context/toastNotificationProvider";
import { testDuplicatePermissionGroupName } from "util/permissions";
import { renameIdpGroup, renamePermissionGroup } from "api/permissions";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import DeletePermissionGroupBtn from "./DeletePermissionGroupBtn";
import { IdpGroup, LxdGroup } from "types/permissions";

interface Props {
  group: LxdGroup | IdpGroup;
  groupType: "lxd-groups" | "idp-groups";
}

const PermissionGroupHeader: FC<Props> = ({
  group,
  groupType = "lxd-groups",
}) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);
  const queryClient = useQueryClient();

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicatePermissionGroupName(controllerState, groupType))
      .required("This field is required"),
  });

  const endpoint = groupType.replace("s", "");
  const queryKey =
    groupType === "lxd-groups"
      ? queryKeys.permissionGroups
      : queryKeys.idpGroups;

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name: group.name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (group.name === values.name) {
        void formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      const mutation =
        groupType === "lxd-groups" ? renamePermissionGroup : renameIdpGroup;

      mutation(group.name, values.name)
        .then(() => {
          navigate(`/ui/permissions/${endpoint}/${values.name}`);
          toastNotify.success(`Group ${group.name} renamed to ${values.name}.`);
          void formik.setFieldValue("isRenaming", false);
          void queryClient.invalidateQueries({
            queryKey: [queryKey],
          });
        })
        .catch((e) => {
          notify.failure("Renaming failed", e);
        })
        .finally(() => formik.setSubmitting(false));
    },
  });

  return (
    <RenameHeader
      name={group.name}
      parentItems={[
        <Link to={`/ui/permissions/${groupType}`} key={1}>
          {groupType === "lxd-groups" ? "LXD" : "IDP"} groups
        </Link>,
      ]}
      controls={[
        <DeletePermissionGroupBtn
          key="delete"
          group={group}
          shouldExpand={true}
          groupType={groupType}
        />,
      ]}
      isLoaded={true}
      formik={formik}
    />
  );
};

export default PermissionGroupHeader;
