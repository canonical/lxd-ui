import { type FC } from "react";
import { CustomSelect, Col, Row } from "@canonical/react-components";
import DividerLine from "components/DividerLine";
import ScrollableForm from "components/ScrollableForm";
import type { FormikProps } from "formik/dist/types";
import ClusterLinkSelector from "pages/cluster/ClusterLinkSelector";
import ReplicatorList from "pages/cluster/ReplicatorList";
import type { LxdConfigPair } from "types/config";
import type {
  ProjectFormValues,
  ProjectReplicaFormValues,
} from "types/forms/project";
import { ensureEditMode } from "util/editMode";
import { getProjectKey } from "util/projectConfigFields";

export const replicaPayload = (
  values: ProjectReplicaFormValues,
): LxdConfigPair => {
  const replicaMode = values.replica_mode || "";
  const replicaCluster = values.replica_cluster || "";

  const payload: LxdConfigPair = {};

  if (replicaMode) {
    payload[getProjectKey("replica_mode")] = replicaMode;
  }
  if (replicaCluster) {
    payload[getProjectKey("replica_cluster")] = replicaCluster;
  }

  return payload;
};

interface Props {
  formik: FormikProps<ProjectFormValues>;
}

const ProjectReplicaForm: FC<Props> = ({ formik }) => {
  const getModeLabel = (modeName: string, modeDescription: string) => (
    <div className="label replica-mode-label">
      <span className="name">{modeName}</span>
      <span className="u-text--muted">{modeDescription}</span>
    </div>
  );

  const modeOptions = [
    {
      value: "",
      label: "None",
      text: "None",
    },
    {
      value: "leader",
      label: getModeLabel("Leader", "Active source project"),
      text: "Leader",
    },
    {
      value: "standby",
      label: getModeLabel(
        "Standby",
        "Read-only failover target. Acts as a passive receiver for replicated data from the remote leader cluster.",
      ),
      text: "Standby",
    },
  ];

  const getClusterHelpText = (mode?: string) => {
    if (!mode) {
      return null;
    }

    if (mode === "leader") {
      return (
        <>
          Cluster to replicate to. The project will be replicated to this
          cluster.
          <br />
        </>
      );
    }

    if (mode === "standby") {
      return (
        <>
          Cluster to replicate from. The project will receive data from this
          cluster.
          <br />
        </>
      );
    }

    return null;
  };

  return (
    <ScrollableForm>
      <Row>
        <Col size={12}>
          <CustomSelect
            name="replica_mode"
            label="Replica mode"
            options={modeOptions}
            value={formik.values.replica_mode || ""}
            onChange={(value) => {
              ensureEditMode(formik);
              formik.setFieldValue("replica_mode", value);
            }}
            error={
              formik.touched.replica_mode ? formik.errors.replica_mode : null
            }
            dropdownClassName="replica-mode-dropdown"
            disabled={!!formik.values.editRestriction}
          />
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
              formik.setFieldError("replica_cluster", undefined);
              void formik.setFieldTouched("replica_cluster", true, false);
              void formik
                .setFieldValue("replica_cluster", value, false)
                .then(() => {
                  void formik.validateField("replica_cluster");
                });
            }}
            help={getClusterHelpText(formik.values.replica_mode)}
            disabled={!!formik.values.editRestriction}
          />
        </Col>
      </Row>

      <DividerLine />

      <Row>
        <Col size={12}>
          Replicators for this project
          <ReplicatorList
            variant="project-configuration"
            project={formik.values.name}
          />
        </Col>
      </Row>
    </ScrollableForm>
  );
};

export default ProjectReplicaForm;
