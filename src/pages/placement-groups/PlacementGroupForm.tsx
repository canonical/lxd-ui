import { Form, Input, Select } from "@canonical/react-components";
import type { FC } from "react";
import type { FormikProps } from "formik/dist/types";

export interface PlacementGroupFormValues {
  name?: string;
  description?: string;
  policy?: "compact" | "spread";
  rigor?: "strict" | "permissive";
}

interface Props {
  formik: FormikProps<PlacementGroupFormValues>;
  isEdit?: boolean;
}

const PlacementGroupForm: FC<Props> = ({ formik, isEdit = false }) => {
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
        error={formik.touched.name ? formik.errors.name : null}
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
        error={formik.touched.description ? formik.errors.description : null}
      />
      <Select
        {...formik.getFieldProps("policy")}
        label="Policy"
        options={[
          { value: "compact", label: "Compact" },
          { value: "spread", label: "Spread" },
        ]}
      />
      <Select
        {...formik.getFieldProps("rigor")}
        label="Rigor"
        options={[
          { value: "strict", label: "Strict" },
          { value: "permissive", label: "Permissive" },
        ]}
      />
    </Form>
  );
};

export default PlacementGroupForm;
