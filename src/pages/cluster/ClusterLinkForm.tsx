import { Form, Input, Label, RadioInput } from "@canonical/react-components";
import type { FC } from "react";
import GroupSelection from "pages/permissions/panels/GroupSelection";
import { useAuthGroups } from "context/useAuthGroups";
import type { FormikProps } from "formik/dist/types";

export interface ClusterLinkFormValues {
  name: string;
  description?: string;
  token?: string;
  tokenType?: "generate" | "consume";
  authGroups: string[];
  isCreating: boolean;
}

interface Props {
  formik: FormikProps<ClusterLinkFormValues>;
}

const ClusterLinkForm: FC<Props> = ({ formik }) => {
  const { data: authGroups = [] } = useAuthGroups();

  return (
    <Form onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      {formik.values.isCreating && (
        <Input
          {...formik.getFieldProps("name")}
          type="text"
          label="Name"
          placeholder="Enter name"
          required
          autoFocus
          error={formik.touched.name ? formik.errors.name : null}
        />
      )}
      <Input
        {...formik.getFieldProps("description")}
        type="text"
        label="Description"
        placeholder="Enter description"
      />
      {formik.values.isCreating && (
        <>
          <div className="u-sv1">
            <RadioInput
              inline
              labelClassName="margin-right"
              label="Generate token"
              checked={formik.values.tokenType === "generate"}
              onClick={() => {
                formik.setFieldValue("tokenType", "generate");
              }}
            />
            <RadioInput
              inline
              label="Consume token"
              checked={formik.values.tokenType === "consume"}
              onClick={() => {
                formik.setFieldValue("tokenType", "consume");
              }}
            />
          </div>
          {formik.values.tokenType === "consume" && (
            <Input
              {...formik.getFieldProps("token")}
              type="text"
              label="Token"
              placeholder="Enter token"
            />
          )}
        </>
      )}
      <Label className="u-sv-2">Auth groups</Label>
      <p className="u-text--muted u-sv-1">
        Control access for incoming request on the cluster link.
      </p>
      <GroupSelection
        groups={authGroups}
        modifiedGroups={new Set(formik.values.authGroups)}
        parentItemName="cluster link"
        selectedGroups={new Set(formik.values.authGroups)}
        setSelectedGroups={(val, isUnselectAll) => {
          if (isUnselectAll) {
            formik.setFieldValue("authGroups", []);
          } else {
            formik.setFieldValue("authGroups", val);
          }
        }}
        toggleGroup={(group) => {
          const currentGroups = formik.values.authGroups;
          if (currentGroups.includes(group)) {
            formik.setFieldValue(
              "authGroups",
              currentGroups.filter((g) => g !== group),
            );
          } else {
            formik.setFieldValue("authGroups", [...currentGroups, group]);
          }
        }}
        scrollDependencies={[formik]}
      />
    </Form>
  );
};

export default ClusterLinkForm;
