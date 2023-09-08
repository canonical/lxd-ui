import React, { FC, useState } from "react";
import { Button, Col, Row } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNotify } from "context/notify";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import { checkDuplicateName } from "util/helpers";
import { updateNetwork } from "api/networks";
import NetworkForm, {
  NetworkFormValues,
  toNetwork,
} from "pages/networks/forms/NetworkForm";
import { LxdNetwork } from "types/network";
import { yamlToObject } from "util/yaml";
import { dump as dumpYaml } from "js-yaml";
import { getNetworkEditValues } from "util/networkEdit";

interface Props {
  network: LxdNetwork;
  project: string;
}

const EditNetwork: FC<Props> = ({ network, project }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [isReadOnly, setReadOnly] = useState(true);

  const NetworkSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A network with this name already exists",
        (value) =>
          value === network.name ||
          checkDuplicateName(value, project, controllerState, "networks")
      )
      .required("Network name is required"),
  });

  const formik = useFormik<NetworkFormValues>({
    initialValues: getNetworkEditValues(network),
    validationSchema: NetworkSchema,
    onSubmit: (values) => {
      const yaml = values.yaml ? values.yaml : getYaml();
      const saveNetwork = yamlToObject(yaml);
      updateNetwork({ ...saveNetwork, etag: network.etag }, project)
        .then(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.networks],
          });
          notify.success("Network updated.");
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Network update failed", e);
        });
    },
  });

  const getYaml = () => {
    const exclude = new Set([
      "used_by",
      "etag",
      "status",
      "locations",
      "managed",
    ]);
    const bareNetwork = Object.fromEntries(
      Object.entries(network).filter((e) => !exclude.has(e[0]))
    );
    const formValues = toNetwork(formik.values);
    return dumpYaml({ ...bareNetwork, ...formValues });
  };

  return (
    <>
      <NetworkForm formik={formik} getYaml={getYaml} isReadOnly={isReadOnly} />
      <div className="p-bottom-controls">
        <hr />
        <Row className="u-align--right">
          <Col size={12}>
            {isReadOnly ? (
              <Button appearance="positive" onClick={() => setReadOnly(false)}>
                Edit network
              </Button>
            ) : (
              <>
                <Button
                  appearance="base"
                  onClick={() => {
                    setReadOnly(true);
                    void formik.setValues(getNetworkEditValues(network));
                  }}
                >
                  Cancel
                </Button>
                <SubmitButton
                  isSubmitting={formik.isSubmitting}
                  isDisabled={!formik.isValid || !formik.values.name}
                  buttonLabel="Update"
                  onClick={() => void formik.submitForm()}
                />
              </>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
};

export default EditNetwork;
