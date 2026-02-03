import type { FC, ReactNode } from "react";
import { Form, Input } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import type { GroupSubForm } from "pages/permissions/panels/CreateGroupPanel";
import FormLink from "components/FormLink";
import { pluralize } from "util/instanceBulkActions";
import type { LxdAuthGroup } from "types/permissions";
import { useGroupEntitlements } from "util/entitlements/groups";
import type { PermissionGroupFormValues } from "types/forms/permissionGroup";

interface Props {
  formik: FormikProps<PermissionGroupFormValues>;
  setSubForm: (subForm: GroupSubForm) => void;
  identityCount: number;
  identityModifyCount: number;
  permissionCount: number;
  permissionModifyCount: number;
  isEditing?: boolean;
  group?: LxdAuthGroup;
}

const GroupForm: FC<Props> = ({
  formik,
  setSubForm,
  identityCount,
  identityModifyCount,
  permissionCount,
  permissionModifyCount,
  isEditing = true,
  group,
}) => {
  const { canEditGroup } = useGroupEntitlements();
  const getFormProps = (id: "name" | "description") => {
    return {
      id: id,
      name: id,
      onBlur: formik.handleBlur,
      onChange: formik.handleChange,
      value: formik.values[id] ?? "",
      error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
      placeholder: `Enter ${id.replaceAll("_", " ")}`,
    };
  };

  const groupEditRestriction =
    !isEditing || canEditGroup(group)
      ? ""
      : "You do not have permission to modify this group";

  return (
    <Form onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <Input
        {...getFormProps("name")}
        type="text"
        label="Name"
        required
        autoFocus
        disabled={!!groupEditRestriction}
        title={groupEditRestriction}
      />
      <AutoExpandingTextArea
        {...getFormProps("description")}
        label="Description"
        disabled={!!groupEditRestriction}
        title={groupEditRestriction}
      />
      <FormLink
        title={(isEditing ? "Edit " : "Add ") + pluralize("identity", 2)}
        icon="user-group"
        onClick={() => {
          setSubForm("identity");
        }}
        isModified={identityModifyCount > 0}
        subText={
          identityCount === 0
            ? `No ${pluralize("identity", 2)}`
            : `${identityCount} ${pluralize("identity", identityCount)}`
        }
      />
      <FormLink
        title={(isEditing ? "Edit " : "Add ") + pluralize("permission", 2)}
        icon="lock-locked"
        onClick={() => {
          setSubForm("permission");
        }}
        isModified={permissionModifyCount > 0}
        subText={
          permissionCount === 0
            ? `No ${pluralize("permission", 2)}`
            : `${permissionCount} ${pluralize("permission", permissionCount)}`
        }
      />
    </Form>
  );
};

export default GroupForm;
