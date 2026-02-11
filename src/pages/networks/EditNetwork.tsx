import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  Button,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { checkDuplicateName } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import { updateNetwork, updateClusterNetwork } from "api/networks";
import type { NetworkFormValues } from "types/forms/network";
import NetworkForm, {
  isNetworkFormInvalid,
  toNetwork,
} from "pages/networks/forms/NetworkForm";
import type { LxdNetwork } from "types/network";
import { objectToYaml, yamlToObject } from "util/yaml";
import { toNetworkFormValues } from "util/networkForm";
import { slugify } from "util/slugify";
import { useLocation, useNavigate } from "react-router-dom";
import {
  GENERAL,
  CONNECTIONS,
  YAML_CONFIGURATION,
} from "pages/networks/forms/NetworkFormMenu";
import FormFooterLayout from "components/forms/FormFooterLayout";
import YamlSwitch from "components/forms/YamlSwitch";
import FormSubmitBtn from "components/forms/FormSubmitBtn";
import { scrollToElement } from "util/scroll";
import { useClusterMembers } from "context/useClusterMembers";
import { useNetworkEntitlements } from "util/entitlements/networks";
import { useNetworkFromClusterMembers } from "context/useNetworks";
import {
  clusteredTypes,
  isNetwork,
  notifyNetworkError,
  ovnType,
} from "util/networks";
import NetworkRichChip from "./NetworkRichChip";

interface Props {
  network: LxdNetwork;
  project: string;
}

const EditNetwork: FC<Props> = ({ network, project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const { hash } = useLocation();
  const initialSection = hash ? hash.substring(1) : slugify(CONNECTIONS);
  const [section, updateSection] = useState(initialSection);

  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const [version, setVersion] = useState(0);
  const { data: clusterMembers = [] } = useClusterMembers();
  const { canEditNetwork } = useNetworkEntitlements();

  const shouldLoadMemberSpecificSettings =
    network.managed && clusteredTypes.includes(network.type);
  const { data: networkOnMembers = [], error } = useNetworkFromClusterMembers(
    network.name,
    project,
    shouldLoadMemberSpecificSettings,
  );

  useEffect(() => {
    if (error) {
      notify.failure("Loading network from cluster members failed", error);
    }
  }, [error]);

  const networkOnMembersFulfilled = networkOnMembers.filter(isNetwork);
  useEffect(() => {
    notifyNetworkError(networkOnMembers, notify);
  }, [networkOnMembers]);

  const NetworkSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A network with this name already exists",
        async (value) =>
          value === network.name ||
          checkDuplicateName(value, project, controllerState, "networks"),
      )
      .required("Network name is required"),
    network: Yup.string().test(
      "required",
      "Uplink network is required",
      (value, context) =>
        (context.parent as NetworkFormValues).networkType !== ovnType ||
        Boolean(value),
    ),
  });

  const editRestriction = canEditNetwork(network)
    ? undefined
    : "You do not have permission to edit this network";

  const formik = useFormik<NetworkFormValues>({
    initialValues: toNetworkFormValues(
      network,
      networkOnMembersFulfilled,
      editRestriction,
    ),
    validationSchema: NetworkSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const yaml = values.yaml ? values.yaml : getYaml();
      const yamlNetwork = yamlToObject(yaml) as LxdNetwork;
      const saveNetwork = { ...yamlNetwork, etag: network.etag };

      const mutation = async (values: NetworkFormValues) => {
        if (
          values.parentPerClusterMember &&
          Object.keys(values.parentPerClusterMember).length > 0
        ) {
          return updateClusterNetwork(
            saveNetwork,
            project,
            clusterMembers,
            values.parentPerClusterMember,
            values.bridge_external_interfaces_per_member,
            network.config,
          );
        } else {
          return updateNetwork(saveNetwork, project);
        }
      };

      mutation(values)
        .then(() => {
          formik.resetForm({
            values: toNetworkFormValues(yamlNetwork, networkOnMembersFulfilled),
          });

          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              project,
              queryKeys.networks,
              network.name,
            ],
          });

          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              project,
              queryKeys.networks,
              network.name,
              queryKeys.cluster,
            ],
          });

          toastNotify.success(
            <>
              Network{""}
              <NetworkRichChip
                networkName={network.name}
                projectName={project}
              />{" "}
              updated.
            </>,
          );
        })
        .catch((e) => {
          notify.failure("Network update failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
        });
    },
  });

  const getYaml = () => {
    const payload = toNetwork(formik.values);
    return objectToYaml(payload);
  };

  useEffect(() => {
    scrollToElement(initialSection);
    updateSection(initialSection);
  }, [initialSection]);

  const baseUrl = `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}`;

  const setSection = (newSection: string, source: "click" | "scroll") => {
    if (source === "scroll" && section === slugify(YAML_CONFIGURATION)) {
      return;
    }

    if (source === "click") {
      if (newSection === GENERAL) {
        navigate(baseUrl);
      } else {
        navigate(`${baseUrl}/#${slugify(newSection)}`);
      }
    }
    updateSection(slugify(newSection));
  };

  const readOnly = formik.values.readOnly;

  return (
    <>
      <NetworkForm
        key={network.name}
        formik={formik}
        getYaml={getYaml}
        project={project}
        section={section ?? slugify(GENERAL)}
        setSection={setSection}
        version={version}
      />
      <FormFooterLayout>
        <YamlSwitch
          formik={formik}
          section={section}
          setSection={() => {
            setSection(
              section === slugify(YAML_CONFIGURATION)
                ? GENERAL
                : YAML_CONFIGURATION,
              "click",
            );
          }}
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
                void formik.setValues(
                  toNetworkFormValues(network, networkOnMembersFulfilled),
                );
              }}
            >
              Cancel
            </Button>
            <FormSubmitBtn
              formik={formik}
              baseUrl={baseUrl}
              isYaml={section === slugify(YAML_CONFIGURATION)}
              disabled={isNetworkFormInvalid(formik, clusterMembers)}
            />
          </>
        )}
      </FormFooterLayout>
    </>
  );
};

export default EditNetwork;
