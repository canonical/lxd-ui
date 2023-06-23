import React, { FC, useState } from "react";
import { Button, Col, Row } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNotify } from "context/notify";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import { useNavigate, useParams } from "react-router-dom";
import { checkDuplicateName } from "util/helpers";
import { createNetwork } from "api/networks";
import NetworkForm, {
  NetworkFormValues,
  toNetwork,
} from "pages/networks/forms/NetworkForm";
import NotificationRow from "components/NotificationRow";
import { useSettings } from "context/useSettings";
import Loader from "components/Loader";
import { yamlToObject } from "util/yaml";
import { dump as dumpYaml } from "js-yaml";

const CreateNetwork: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { project } = useParams<{ project: string }>();
  const controllerState = useState<AbortController | null>(null);
  const { data: settings, isLoading } = useSettings();
  const hasOvn = Boolean(settings?.config["network.ovn.northbound_connection"]);

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
      name: "",
      type: hasOvn ? "ovn" : "bridge",
      bridge_mode: hasOvn ? undefined : "standard",
      user: [],
    },
    validationSchema: NetworkSchema,
    onSubmit: (values) => {
      const network = values.yaml
        ? yamlToObject(values.yaml)
        : toNetwork(values);
      createNetwork(network, project)
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
    <main className="l-main">
      <div className="p-panel">
        <div className="p-panel__header">
          <h1 className="p-panel__title">Create a network</h1>
        </div>
        <div className="p-panel__content create-network">
          <NotificationRow />
          <NetworkForm formik={formik} getYaml={getYaml} />
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
        </div>
      </div>
    </main>
  );
};

export default CreateNetwork;
