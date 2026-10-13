import type { FC } from "react";
import { Button, Icon, Input, MainTable } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useProjects } from "context/useProjects";
import type { FormikProps } from "formik";
import ProjectSelector from "pages/networks/forms/ProjectSelector";
import type { StoragePoolFormValues } from "types/forms/storagePool";
import { ensureEditMode } from "util/editMode";
import { defaultFirst, generateUUID } from "util/helpers";

interface Props {
  formik: FormikProps<StoragePoolFormValues>;
}

const StoragePoolFormCephReplicators: FC<Props> = ({ formik }) => {
  const { data: projects = [] } = useProjects();
  const sortedProjects = [...projects].sort(defaultFirst);
  const replicators = formik.values.ceph_replicators ?? [];

  const hasAvailableProjects = projects.some(
    (project) =>
      !replicators.some((replicator) => replicator.project === project.name),
  );

  const disabledReason = () => {
    if (formik.values.editRestriction) {
      return formik.values.editRestriction;
    }
    if (formik.values.ceph_rbd_clone_copy !== "false") {
      return "Set RBD clone copy to false before adding replication keys.";
    }
    if (!hasAvailableProjects) {
      return "No projects available for replication.";
    }
    return undefined;
  };

  const updateReplicator = (
    index: number,
    field: "project" | "peerSite",
    value: string,
  ): void => {
    const updatedReplicators = replicators.map((replicator) => ({
      ...replicator,
    }));
    updatedReplicators[index] = {
      ...replicators[index],
      [field]: value,
    };
    ensureEditMode(formik);
    void formik.setFieldValue("ceph_replicators", updatedReplicators, false);
  };

  const addReplicator = (): void => {
    ensureEditMode(formik);
    void formik.setFieldValue(
      "ceph_replicators",
      [...replicators, { project: "", peerSite: "", id: generateUUID() }],
      false,
    );
  };

  const removeReplicator = (index: number): void => {
    ensureEditMode(formik);
    void formik.setFieldValue(
      "ceph_replicators",
      replicators.filter((_, rowIndex) => rowIndex !== index),
    );
  };

  const replicatorRows: MainTableRow[] = replicators.map(
    ({ id, project, peerSite }, index) => ({
      key: id,
      columns: formik.values.readOnly
        ? [
            {
              content: project,
              role: "rowheader",
              "aria-label": "Project",
              className: "project u-truncate",
              title: project,
            },
            {
              content: peerSite,
              role: "cell",
              "aria-label": "Peer Ceph site",
              className: "peer-ceph-site u-truncate",
              title: peerSite,
            },
            {
              content: (
                <Button
                  appearance="base"
                  onClick={() => {
                    ensureEditMode(formik);
                  }}
                  className="u-no-margin--bottom"
                  hasIcon
                  title={formik.values.editRestriction ?? "Edit"}
                  type="button"
                >
                  <Icon name="edit" />
                </Button>
              ),
            },
          ]
        : [
            {
              content: (
                <ProjectSelector
                  id={`ceph-replicator-project-${index}`}
                  name={`ceph-replicator-project-${index}`}
                  label="Project"
                  labelClassName="u-off-screen"
                  defaultToggleLabel="Select a project"
                  value={project}
                  setValue={(value) => {
                    updateReplicator(index, "project", value);
                  }}
                  projects={sortedProjects.filter(
                    ({ name }) =>
                      name === project ||
                      !replicators.some(
                        (replicator) => replicator.project === name,
                      ),
                  )}
                  disabled={!!formik.values.editRestriction}
                />
              ),
              role: "rowheader",
              "aria-label": "Project",
              className: "project",
            },
            {
              content: (
                <Input
                  id={`ceph-replicator-site-${index}`}
                  aria-label={`Peer Ceph site ${index + 1}`}
                  placeholder="Peer Ceph site"
                  type="text"
                  value={peerSite}
                  onChange={(event) => {
                    updateReplicator(index, "peerSite", event.target.value);
                  }}
                />
              ),
              role: "cell",
              "aria-label": "Peer Ceph site",
              className: "peer-ceph-site",
            },
            {
              content: (
                <Button
                  appearance="base"
                  onClick={() => {
                    removeReplicator(index);
                  }}
                  className="u-no-margin--bottom"
                  hasIcon
                  title="Delete"
                  type="button"
                >
                  <Icon name="delete" />
                </Button>
              ),
              role: "cell",
              "aria-label": "Actions",
              className: "actions",
            },
          ],
    }),
  );

  return (
    <div className="ceph-replicators-form configuration-table">
      <b>Ceph replicators</b>
      <p className="configuration-help">
        Name of the peer Ceph site to mirror an existing project&apos;s volumes
        to. <br />
        The value of RBD clone copy must be <code>false</code> to mirror the
        project&apos;s volumes.
      </p>
      {replicatorRows.length > 0 && (
        <MainTable
          id="ceph-replicators-table"
          headers={[
            { content: "Project", className: "project" },
            { content: "Peer Ceph site", className: "peer-ceph-site" },
            { "aria-label": "Actions", className: "actions" },
          ]}
          rows={replicatorRows}
          className="ceph-replicators-table"
        />
      )}
      <Button
        id="add-ceph-replicator-btn"
        type="button"
        onClick={addReplicator}
        hasIcon
        disabled={!!disabledReason()}
        title={disabledReason()}
      >
        <Icon name="plus" />
        <span>Add peer Ceph site</span>
      </Button>
    </div>
  );
};

export default StoragePoolFormCephReplicators;
