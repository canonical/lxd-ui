import { type FC } from "react";
import type { FormikProps } from "formik";
import { Form, Input, OutputField, Select } from "@canonical/react-components";
import { Link } from "react-router";
import DocLink from "components/DocLink";
import { useProjects } from "context/useProjects";
import ClusterLinkSelector from "pages/cluster/ClusterLinkSelector";
import { SnapshotScheduleInput } from "pages/cluster/SnapshotScheduleInput";
import ProjectSelector from "pages/networks/forms/ProjectSelector";
import { optionYesNo } from "util/options";
import { ROOT_PATH } from "util/rootPath";
import type { ReplicatorFormValues } from "types/forms/replicator";

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
      <ClusterLinkSelector
        value={formik.values.cluster}
        required
        error={formik.touched.cluster ? formik.errors.cluster : undefined}
        onChange={(value) => {
          formik.setFieldError("cluster", undefined);
          void formik.setFieldTouched("cluster", true, false);
          void formik.setFieldValue("cluster", value, false).then(() => {
            void formik.validateField("cluster");
          });
        }}
        help="Cluster to replicate to. "
        takeFocus
      />
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
            void formik.setFieldValue("project", value);
          }}
          disabled={isEdit}
          projects={projects}
          help="Source project."
          required
          error={getFieldError("project")}
        />
      )}
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
