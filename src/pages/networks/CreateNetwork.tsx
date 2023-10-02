import React, { FC, useState } from "react";
import { Button, Col, Row, useNotify } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import { useNavigate, useParams } from "react-router-dom";
import { checkDuplicateName } from "util/helpers";
import { createClusterBridge, createNetwork } from "api/networks";
import NetworkForm, {
  NetworkFormValues,
  toNetwork,
} from "pages/networks/forms/NetworkForm";
import NotificationRow from "components/NotificationRow";
import { useSettings } from "context/useSettings";
import Loader from "components/Loader";
import { yamlToObject } from "util/yaml";
import { dump as dumpYaml } from "js-yaml";
import { isClusteredServer, supportsOvnNetwork } from "util/settings";
import { fetchClusterMembers } from "api/cluster";
import BaseLayout from "components/BaseLayout";

const CreateNetwork: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { project } = useParams<{ project: string }>();
  const controllerState = useState<AbortController | null>(null);
  const { data: settings, isLoading } = useSettings();
  const isClustered = isClusteredServer(settings);
  const hasOvn = supportsOvnNetwork(settings);

  const { data: clusterMembers = [] } = useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members],
    queryFn: fetchClusterMembers,
    enabled: isClustered,
  });

  if (!project) {
    return <>Missing project</>;
  }

  if (isLoading) {
    return <Loader />;
  }

  const NetworkSchema = Yup.object().shape({
    name: Yup.string()
      .test("deduplicate", "A network with this name already exists", (value) =>
        checkDuplicateName(value, project, controllerState, "networks")
      )
      .required("Network name is required"),
  });

  const formik = useFormik<NetworkFormValues>({
    initialValues: {
      readOnly: false,
      name: "",
      type: hasOvn ? "ovn" : "bridge",
      bridge_mode: hasOvn ? undefined : "standard",
    },
    validationSchema: NetworkSchema,
    onSubmit: (values) => {
      const network = values.yaml
        ? yamlToObject(values.yaml)
        : toNetwork(values);

      const mutation =
        isClustered && values.type !== "ovn"
          ? () => createClusterBridge(network, project, clusterMembers)
          : () => createNetwork(network, project);

      mutation()
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.networks],
          });
          navigate(
            `/ui/project/${project}/networks`,
            notify.queue(notify.success(`Network ${values.name} created.`))
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Network creation failed", e);
        });
    },
  });

  const getYaml = () => {
    const payload = toNetwork(formik.values);
    return dumpYaml(payload);
  };

  return (
    <BaseLayout title="Create a network" contentClassName="create-network">
      <NotificationRow />
      <NetworkForm formik={formik} getYaml={getYaml} project={project} />
      <div className="p-bottom-controls">
        <hr />
        <Row className="u-align--right">
          <Col size={12}>
            <Button
              appearance="base"
              onClick={() => navigate(`/ui/project/${project}/networks`)}
            >
              Cancel
            </Button>
            <SubmitButton
              isSubmitting={formik.isSubmitting}
              isDisabled={!formik.isValid || !formik.values.name}
              buttonLabel="Create"
              onClick={() => void formik.submitForm()}
            />
          </Col>
        </Row>
      </div>
    </BaseLayout>
  );
};

export default CreateNetwork;
