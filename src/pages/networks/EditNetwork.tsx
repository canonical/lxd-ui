import { FC, useState } from "react";
import { ActionButton, Button, useNotify } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { checkDuplicateName } from "util/helpers";
import { updateNetwork } from "api/networks";
import NetworkForm, {
  NetworkFormValues,
  toNetwork,
} from "pages/networks/forms/NetworkForm";
import { LxdNetwork } from "types/network";
import { yamlToObject } from "util/yaml";
import { dump as dumpYaml } from "js-yaml";
import { toNetworkFormValues } from "util/networkForm";
import { slugify } from "util/slugify";
import { useNavigate, useParams } from "react-router-dom";
import { MAIN_CONFIGURATION } from "pages/networks/forms/NetworkFormMenu";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  network: LxdNetwork;
  project: string;
}

const EditNetwork: FC<Props> = ({ network, project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();

  const { section } = useParams<{ section?: string }>();
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
    network: Yup.string().test(
      "required",
      "Uplink network is required",
      (value, context) =>
        (context.parent as NetworkFormValues).networkType !== "ovn" ||
        Boolean(value),
    ),
  });

  const formik = useFormik<NetworkFormValues>({
    initialValues: toNetworkFormValues(network),
    validationSchema: NetworkSchema,
    onSubmit: (values) => {
      const yaml = values.yaml ? values.yaml : getYaml();
      const saveNetwork = yamlToObject(yaml) as LxdNetwork;
      updateNetwork({ ...saveNetwork, etag: network.etag }, project)
        .then(() => {
          void formik.setValues(toNetworkFormValues(saveNetwork));
          void queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              project,
              queryKeys.networks,
              network.name,
            ],
          });
          toastNotify.success(`Network ${network.name} updated.`);
        })
        .catch((e) => {
          notify.failure("Network update failed", e);
        })
        .finally(() => formik.setSubmitting(false));
    },
  });

  const getYaml = () => {
    return dumpYaml(toNetwork(formik.values));
  };

  const setSection = (newSection: string) => {
    const baseUrl = `/ui/project/${project}/network/${network.name}/configuration`;
    newSection === MAIN_CONFIGURATION
      ? navigate(baseUrl)
      : navigate(`${baseUrl}/${slugify(newSection)}`);
  };

  const readOnly = formik.values.readOnly;

  return (
    <>
      <NetworkForm
        formik={formik}
        getYaml={getYaml}
        project={project}
        section={section ?? slugify(MAIN_CONFIGURATION)}
        setSection={setSection}
      />
      <FormFooterLayout>
        {readOnly ? (
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
              onClick={() => formik.setValues(toNetworkFormValues(network))}
            >
              Cancel
            </Button>
            <ActionButton
              appearance="positive"
              loading={formik.isSubmitting}
              disabled={!formik.isValid || !formik.values.name}
              onClick={() => void formik.submitForm()}
            >
              Save changes
            </ActionButton>
          </>
        )}
      </FormFooterLayout>
    </>
  );
};

export default EditNetwork;
