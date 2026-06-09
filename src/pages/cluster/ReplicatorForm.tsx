import type { FC } from "react";
import type { FormikProps } from "formik";
import { Form, Input, Select } from "@canonical/react-components";
import type { ReplicatorFormValues } from "types/forms/replicator";
import ProjectSelector from "pages/networks/forms/ProjectSelector";
import { useProjects } from "context/useProjects";
import ReplicatorClusterLinkSelector from "pages/cluster/ReplicatorClusterLinkSelector";
import OutputField from "components/OutputField";
import { Link } from "react-router";
import DocLink from "components/DocLink";
import { ROOT_PATH } from "util/rootPath";
import { SnapshotScheduleInput } from "pages/cluster/SnapshotScheduleInput";
import { optionYesNo } from "util/options";

interface Props {
  formik: FormikProps<ReplicatorFormValues>;
  isEdit?: boolean;
}

export const ReplicatorForm: FC<Props> = ({ formik, isEdit = false }) => {
  const { data: projects = [] } = useProjects();

  const getFieldError = (fieldName: keyof ReplicatorFormValues) => {
    return formik.touched[fieldName] ? formik.errors[fieldName] : undefined;
  };

  return (
    <Form onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      {isEdit ? (
        <OutputField
          id="Name"
          label="Name"
          value={formik.values.name}
          help={
            <>
              Click the name in the header of the{" "}
              <Link
                to={`${ROOT_PATH}/ui/project/${encodeURIComponent(formik.values.project)}/replicator/${encodeURIComponent(formik.values.name)}`}
              >
                detail page
              </Link>{" "}
              to rename the replicator.
            </>
          }
        />
      ) : (
        <Input
          {...formik.getFieldProps("name")}
          type="text"
          autoFocus={!isEdit}
          label="Name"
          required
          error={getFieldError("name")}
          placeholder="Enter name"
        />
      )}

      <Input
        {...formik.getFieldProps("description")}
        type="text"
        autoFocus={isEdit}
        label="Description"
        placeholder="Enter description"
        error={getFieldError("description")}
      />
      {isEdit ? (
        <OutputField
          id="Project"
          label="Project"
          value={formik.values.project}
          help="Project cannot be changed."
        />
      ) : (
        <ProjectSelector
          id="project"
          name="project"
          label="Project"
          value={formik.values.project || ""}
          setValue={(value) => {
            void formik.setFieldTouched("project", true);
            void formik.setFieldValue("project", value, true);
          }}
          disabled={isEdit}
          projects={projects}
          help="Source project."
          required
          error={getFieldError("project")}
        />
      )}
      <ReplicatorClusterLinkSelector formik={formik} />
      <Select
        {...formik.getFieldProps("snapshot")}
        label="Snapshot"
        options={optionYesNo}
        help={
          <>
            Enable snapshots to{" "}
            <DocLink docPath="/reference/storage_drivers/#optimized-volume-refresh">
              optimize instance refresh
            </DocLink>
            .
          </>
        }
      />
      <SnapshotScheduleInput formik={formik} />
    </Form>
  );
};
