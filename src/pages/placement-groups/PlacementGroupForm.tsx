import { Form, Input, Select } from "@canonical/react-components";
import type { FC } from "react";
import type { FormikProps } from "formik/dist/types";

export interface PlacementGroupFormValues {
  name?: string;
  description?: string;
  scope?: string;
  policy?: string;
  rigor?: string;
  clusterGroup?: string;
}

interface Props {
  formik: FormikProps<PlacementGroupFormValues>;
}

const PlacementGroupForm: FC<Props> = ({ formik }) => {
  return (
    <Form onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <Input
        {...formik.getFieldProps("name")}
        type="text"
        label="Name"
        required
        autoFocus
        error={formik.touched.name ? formik.errors.name : null}
        placeholder="Enter name"
      />
      <Input
        {...formik.getFieldProps("description")}
        type="text"
        label="Description"
        placeholder="Enter description"
        error={formik.touched.description ? formik.errors.description : null}
      />
      <Select
        {...formik.getFieldProps("policy")}
        label="Policy"
        options={[
          { value: "compact", label: "Compact" },
          { value: "distribute", label: "Distribute" },
        ]}
      />
      <Select
        {...formik.getFieldProps("scope")}
        label="Scope"
        options={[
          { value: "cluster-member", label: "Cluster member" },
          { value: "failure-domain", label: "Failure domain" },
        ]}
      />
      <Input
        {...formik.getFieldProps("clusterGroup")}
        type="text"
        label="Cluster group"
        placeholder="Enter group"
        error={formik.touched.clusterGroup ? formik.errors.clusterGroup : null}
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
