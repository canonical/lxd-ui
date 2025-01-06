import { FC, useState } from "react";
import { Button, Notification, useNotify } from "@canonical/react-components";
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
import {
  MAIN_CONFIGURATION,
  YAML_CONFIGURATION,
} from "pages/networks/forms/NetworkFormMenu";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";
import YamlSwitch from "components/forms/YamlSwitch";
import FormSubmitBtn from "components/forms/FormSubmitBtn";
import ResourceLink from "components/ResourceLink";

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
  const [version, setVersion] = useState(0);

  if (!network?.managed) {
    return (
      <Notification severity="negative">
        Configuration is only available for managed networks. This network is
        not managed.
      </Notification>
    );
  }

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
    enableReinitialize: true,
    onSubmit: (values) => {
      const yaml = values.yaml ? values.yaml : getYaml();
      const saveNetwork = yamlToObject(yaml) as LxdNetwork;
      updateNetwork({ ...saveNetwork, etag: network.etag }, project)
        .then(() => {
          formik.resetForm({
            values: toNetworkFormValues(saveNetwork),
          });

          void queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              project,
              queryKeys.networks,
              network.name,
            ],
          });
          toastNotify.success(
            <>
              Network{""}
              <ResourceLink
                type="network"
                value={network.name}
                to={`/ui/project/${project}/network/${network.name}`}
              />{" "}
              updated.
            </>,
          );
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
    if (newSection === MAIN_CONFIGURATION) {
      void navigate(baseUrl);
    } else {
      void navigate(`${baseUrl}/${slugify(newSection)}`);
    }
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
        version={version}
      />
      <FormFooterLayout>
        <YamlSwitch
          formik={formik}
          section={section}
          setSection={setSection}
          disableReason={
            formik.values.name
              ? undefined
              : "Please enter a network name to enable this section"
          }
        />
        {readOnly ? null : (
          <>
            <Button
              appearance="base"
              onClick={() => {
                setVersion((old) => old + 1);
                void formik.setValues(toNetworkFormValues(network));
              }}
            >
              Cancel
            </Button>
            <FormSubmitBtn
              formik={formik}
              isYaml={section === slugify(YAML_CONFIGURATION)}
              disabled={!formik.values.name}
            />
          </>
        )}
      </FormFooterLayout>
    </>
  );
};

export default EditNetwork;
