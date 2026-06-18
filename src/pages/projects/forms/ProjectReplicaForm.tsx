import { type FC } from "react";
import { Col, Field, Notification, Row } from "@canonical/react-components";
import ScrollableForm from "components/ScrollableForm";
import type { FormikProps } from "formik/dist/types";
import ClusterLinkSelector from "pages/cluster/ClusterLinkSelector";
import ReplicatorList from "pages/cluster/ReplicatorList";
import PromoteProjectBtn from "pages/projects/actions/PromoteProjectBtn";
import DemoteProjectBtn from "pages/projects/actions/DemoteProjectBtn";
import type { LxdConfigPair } from "types/config";
import type {
  ProjectFormValues,
  ProjectReplicaFormValues,
} from "types/forms/project";
import { ensureEditMode } from "util/editMode";
import ClearProjectReplicaModeBtn from "../actions/ClearProjectReplicaModeBtn";

export const replicaPayload = (
  values: ProjectReplicaFormValues,
): LxdConfigPair => {
  if (!values.replica_cluster) {
    return {};
  }
  return {
    "replica.cluster": values.replica_cluster,
  };
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
  isEdit: boolean;
}

const ProjectReplicaForm: FC<Props> = ({ formik, isEdit }) => {
  const getClusterHelpText = (mode?: string) => {
    if (!mode) {
      return null;
    }

    if (mode === "leader") {
      return (
        <>
          Cluster to replicate this project to.
          <br />
        </>
      );
    }

    if (mode === "standby") {
      return (
        <>
          Cluster this project will receive data from.
          <br />
        </>
      );
    }

    return null;
  };

  const getModeDescription = (mode: string) => {
    if (mode === "leader") {
      return "This project is the active source project for replication. Its instances can be replicated to a remote standby cluster.";
    }
    if (mode === "standby") {
      return "This project is a read-only failover target. It acts as a passive receiver for replicated data from the remote leader cluster.";
    }
    return "No replication configuration applied.";
  };

  const getModeActionButtons = (mode?: string) => {
    const buttons = [];
    if (mode !== "leader") {
      buttons.push(
        <PromoteProjectBtn
          project={formik.values.name}
          isEdit={isEdit}
          key="promote-btn"
        />,
      );
    }

    if (mode !== "standby") {
      buttons.push(
        <DemoteProjectBtn
          project={formik.values.name}
          isEdit={isEdit}
          key="demote-btn"
        />,
      );
    }

    if (mode) {
      buttons.push(
        <ClearProjectReplicaModeBtn
          project={formik.values.name}
          isEdit={isEdit}
          key="clear-btn"
        />,
      );
    }

    return buttons;
  };

  return (
    <ScrollableForm className="project-replica-form">
      <Row>
        <Col size={12}>
          <Field
            forId="replica_mode"
            label="Replica mode"
            help={getModeDescription(formik.values.replica_mode || "")}
            labelClassName="u-no-margin--bottom"
            className="replica-mode-field"
          >
            <div className="replica-mode-output-wrapper">
              <output id="replica_mode" className="mono-font u-sv2">
                <b>{formik.values.replica_mode || "None"}</b>
              </output>

              <div className="replica-mode-action-buttons">
                {getModeActionButtons(formik.values.replica_mode)}
              </div>
            </div>
          </Field>
        </Col>
      </Row>

      <Row>
        <Col size={12}>
          <ClusterLinkSelector
            name="replica_cluster"
            label="Replica cluster"
            value={formik.values.replica_cluster}
            error={
              formik.touched.replica_cluster
                ? formik.errors.replica_cluster
                : undefined
            }
            onChange={(value) => {
              ensureEditMode(formik);
              void formik.setFieldValue("replica_cluster", value);
            }}
            help={getClusterHelpText(formik.values.replica_mode)}
            disabled={!!formik.values.editRestriction}
            emptyOptionLabel="None"
          />
        </Col>
      </Row>
      <Row>
        <Col size={12}>
          <h2 className="p-heading--4">Replicators for this project</h2>
          {isEdit ? (
            <ReplicatorList
              variant="project-configuration"
              project={formik.values.name}
              cluster={formik.values.replica_cluster}
            />
          ) : (
            <Notification
              severity="information"
              title="Outgoing replicators will be managed here."
            >
              Replicators can be created and managed once this project has been
              successfully created.
            </Notification>
          )}
        </Col>
      </Row>
    </ScrollableForm>
  );
};

export default ProjectReplicaForm;
