import { FC, useState } from "react";
import {
  ActionButton,
  Button,
  Row,
  useNotify,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNavigate, useParams } from "react-router-dom";
import { checkDuplicateName } from "util/helpers";
import { createClusterNetwork, createNetwork } from "api/networks";
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
import {
  GENERAL,
  YAML_CONFIGURATION,
} from "pages/networks/forms/NetworkFormMenu";
import { slugify } from "util/slugify";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";
import YamlSwitch from "components/forms/YamlSwitch";
import ResourceLink from "components/ResourceLink";
import { scrollToElement } from "util/scroll";

const CreateNetwork: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { project } = useParams<{ project: string }>();
  const [section, setSection] = useState(slugify(GENERAL));
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
    initialValues: {
      readOnly: false,
      isCreating: true,
      name: "",
      networkType: hasOvn ? "ovn" : "bridge",
      entityType: "network",
    },
    validationSchema: NetworkSchema,
    onSubmit: (values) => {
      const network = values.yaml
        ? yamlToObject(values.yaml)
        : toNetwork(values);

      const mutation =
        isClustered && values.networkType !== "ovn"
          ? () => createClusterNetwork(network, project, clusterMembers)
          : () => createNetwork(network, project);

      mutation()
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.projects, project, queryKeys.networks],
          });
          void navigate(`/ui/project/${project}/networks`);
          toastNotify.success(
            <>
              Network{" "}
              <ResourceLink
                type="network"
                value={values.name}
                to={`/ui/project/${project}/network/${values.name}`}
              />{" "}
              created.
            </>,
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

  const updateSection = (newSection: string, source: "scroll" | "click") => {
    setSection(slugify(newSection));
    if (source === "click") {
      scrollToElement(slugify(newSection));
    }
  };

  return (
    <BaseLayout title="Create a network" contentClassName="create-network">
      <Row>
        <NotificationRow />
        <NetworkForm
          key={formik.values.networkType}
          formik={formik}
          getYaml={getYaml}
          project={project}
          section={section}
          setSection={updateSection}
        />
      </Row>
      <FormFooterLayout>
        <div className="yaml-switch">
          <YamlSwitch
            formik={formik}
            section={section}
            setSection={() =>
              updateSection(
                section === slugify(YAML_CONFIGURATION)
                  ? GENERAL
                  : YAML_CONFIGURATION,
                "click",
              )
            }
            disableReason={
              formik.values.name
                ? undefined
                : "Please enter a network name to enable this section"
            }
          />
        </div>
        <Button
          appearance="base"
          onClick={() => navigate(`/ui/project/${project}/networks`)}
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          disabled={
            !formik.isValid ||
            !formik.values.name ||
            (formik.values.networkType === "ovn" && !formik.values.network)
          }
          onClick={() => void formik.submitForm()}
        >
          Create
        </ActionButton>
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateNetwork;
