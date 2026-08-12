import { Form, Input, Label, OutputField } from "@canonical/react-components";
import type { FC } from "react";
import GroupSelection from "pages/permissions/panels/GroupSelection";
import { useAuthGroups } from "context/useAuthGroups";
import type { FormikProps } from "formik/dist/types";
import ClusterLinkTokenInput from "pages/cluster/ClusterLinkTokenInput";
import type { ClusterLinkFormValues } from "types/forms/clusterLink";

interface Props {
  formik: FormikProps<ClusterLinkFormValues>;
}

const ClusterLinkForm: FC<Props> = ({ formik }) => {
  const { data: authGroups = [] } = useAuthGroups(
    formik.values.type === "bidirectional",
  );

  const selectedGroups = new Set(formik.values.authGroups);
  const initial = new Set(formik.values.initialAuthGroups);
  const removed = [...initial].filter((g) => !selectedGroups.has(g));
  const added = [...selectedGroups].filter((g) => !initial.has(g));
  const modifiedGroups = new Set([...removed, ...added]);
  const hasName = formik.values.name !== "";

  return (
    <Form onSubmit={formik.handleSubmit} className="cluster-link-form">
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      {formik.values.isCreating && (
        <>
          <OutputField
            id="type"
            label="Cluster link type"
            value={formik.values.type}
          />
          <ClusterLinkTokenInput formik={formik} />
          <Input
            {...formik.getFieldProps("name")}
            type="text"
            label="Cluster link name"
            placeholder="Enter name"
            required
            disabled={
              (formik.values.token === "" &&
                (formik.values.type === "unidirectional" ||
                  formik.values.tokenType === "consume")) ||
              (formik.values.type === "bidirectional" &&
                !formik.values.tokenType)
            }
            error={formik.touched.name ? formik.errors.name : null}
          />
        </>
      )}
      <Input
        {...formik.getFieldProps("description")}
        type="text"
        label="Description"
        placeholder="Enter description"
        disabled={!hasName}
        title={
          hasName
            ? undefined
            : "Please enter a name before adding a description"
        }
      />
      {formik.values.type === "bidirectional" && (
        <>
          <Label className="u-sv-2">Auth groups</Label>
          <p className="u-text--muted u-sv-1 p-text--small">
            Control access for incoming requests through this cluster link.
          </p>
          <GroupSelection
            groups={authGroups}
            modifiedGroups={modifiedGroups}
            parentItemName="cluster link"
            selectedGroups={selectedGroups}
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
            disabled={!hasName}
            hasScrollableTable={false}
          />
        </>
      )}
    </Form>
  );
};

export default ClusterLinkForm;
