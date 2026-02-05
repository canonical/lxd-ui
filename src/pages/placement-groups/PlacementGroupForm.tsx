import { Form, Input, Select } from "@canonical/react-components";
import type { FC } from "react";
import type { FormikProps } from "formik/dist/types";
import type { PlacementGroupFormValues } from "types/forms/placementGroup";

export const PLACEMENT_GROUP_POLICY_COMPACT = "compact";
export const PLACEMENT_GROUP_POLICY_SPREAD = "spread";

export const PLACEMENT_GROUP_RIGOR_STRICT = "strict";
export const PLACEMENT_GROUP_RIGOR_PERMISSIVE = "permissive";

interface Props {
  formik: FormikProps<PlacementGroupFormValues>;
  isEdit?: boolean;
}

const PlacementGroupForm: FC<Props> = ({ formik, isEdit = false }) => {
  const getFieldError = (fieldName: keyof PlacementGroupFormValues) => {
    return formik.touched[fieldName] ? formik.errors[fieldName] : undefined;
  };

  return (
    <Form onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <Input
        {...formik.getFieldProps("name")}
        type="text"
        label="Name"
        required
        autoFocus={!isEdit}
        error={getFieldError("name")}
        placeholder="Enter name"
        disabled={isEdit}
        title={isEdit ? "Placement groups can't be renamed" : undefined}
      />
      <Input
        {...formik.getFieldProps("description")}
        type="text"
        autoFocus={isEdit}
        label="Description"
        placeholder="Enter description"
        error={getFieldError("description")}
      />
      <Select
        {...formik.getFieldProps("policy")}
        label="Policy"
        options={[
          { value: PLACEMENT_GROUP_POLICY_COMPACT, label: "Compact" },
          { value: PLACEMENT_GROUP_POLICY_SPREAD, label: "Spread" },
        ]}
        help="Compact packs instances on as few members as possible. Spread distributes instances across members."
      />
      <Select
        {...formik.getFieldProps("rigor")}
        label="Rigor"
        options={[
          { value: PLACEMENT_GROUP_RIGOR_STRICT, label: "Strict" },
          { value: PLACEMENT_GROUP_RIGOR_PERMISSIVE, label: "Permissive" },
        ]}
        help="Strict fails instance creation if no matching member is available. Permissive allows creation to other members."
      />
    </Form>
  );
};

export default PlacementGroupForm;
