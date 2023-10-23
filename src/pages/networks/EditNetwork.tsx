import React, { FC, useState } from "react";
import { Button, Col, Row, useNotify } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import { getNetworkEditValues, handleConfigKeys } from "util/networkEdit";
import { StringSchema } from "yup";
import { slugify } from "util/slugify";
import { useNavigate, useParams } from "react-router-dom";
import { MAIN_CONFIGURATION } from "pages/networks/forms/NetworkFormMenu";
import { YAML_CONFIGURATION } from "pages/profiles/forms/ProfileFormMenu";

interface Props {
  network: LxdNetwork;
  project: string;
}

const EditNetwork: FC<Props> = ({ network, project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { activeSection: section } = useParams<{ activeSection?: string }>();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const NetworkSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A network with this name already exists",
        (value) =>
          value === network.name ||
          checkDuplicateName(value, project, controllerState, "networks"),
      )
      .required("Network name is required"),
    network: Yup.string().when("type", (type: string, schema: StringSchema) =>
      type === "ovn" ? schema.required("Uplink network is required") : schema,
    ),
  });

  const formik = useFormik<NetworkFormValues>({
    initialValues: getNetworkEditValues(network),
    validationSchema: NetworkSchema,
    onSubmit: (values) => {
      const yaml = values.yaml ? values.yaml : getYaml();
      const saveNetwork = yamlToObject(yaml) as LxdNetwork;
      updateNetwork({ ...saveNetwork, etag: network.etag }, project)
        .then(() => {
          formik.setSubmitting(false);
          void formik.setValues(getNetworkEditValues(saveNetwork));
          void queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              project,
              queryKeys.networks,
              network.name,
            ],
          });
          notify.success("Network updated.");
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Network update failed", e);
        });
    },
  });

  const getPayload = (values: NetworkFormValues) => {
    const formNetwork = toNetwork(values);

    const excludeMainKeys = new Set([
      "used_by",
      "etag",
      "status",
      "locations",
      "managed",
      "name",
      "description",
      "config",
      "type",
    ]);
    const missingMainFields = Object.fromEntries(
      Object.entries(network).filter((e) => !excludeMainKeys.has(e[0])),
    );

    const excludeConfigKeys = new Set(handleConfigKeys);
    const missingConfigFields = Object.fromEntries(
      Object.entries(network.config).filter(
        (e) => !excludeConfigKeys.has(e[0]) && !e[0].startsWith("volatile"),
      ),
    );

    return {
      ...missingMainFields,
      ...formNetwork,
      config: {
        ...formNetwork.config,
        ...missingConfigFields,
      },
    };
  };

  const getYaml = () => {
    return dumpYaml(getPayload(formik.values));
  };

  const setSection = (newSection: string) => {
    if (Boolean(formik.values.yaml) && section !== YAML_CONFIGURATION) {
      void formik.setFieldValue("yaml", undefined);
    }

    const baseUrl = `/ui/project/${project}/networks/detail/${network.name}/configuration`;
    newSection === MAIN_CONFIGURATION
      ? navigate(baseUrl)
      : navigate(`${baseUrl}/${slugify(newSection)}`);
  };

  const isReadOnly = formik.values.readOnly;

  return (
    <>
      <NetworkForm
        formik={formik}
        getYaml={getYaml}
        project={project}
        section={section ?? slugify(MAIN_CONFIGURATION)}
        setSection={setSection}
      />
      <div className="p-bottom-controls">
        <hr />
        <Row className="u-align--right">
          <Col size={12}>
            {isReadOnly ? (
              <Button
                appearance="positive"
                onClick={() => void formik.setFieldValue("readOnly", false)}
              >
                Edit network
              </Button>
            ) : (
              <>
                <Button
                  appearance="base"
                  onClick={() =>
                    formik.setValues(getNetworkEditValues(network))
                  }
                >
                  Cancel
                </Button>
                <SubmitButton
                  isSubmitting={formik.isSubmitting}
                  isDisabled={!formik.isValid || !formik.values.name}
                  buttonLabel="Save changes"
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
