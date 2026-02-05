import type { FC } from "react";
import { useState } from "react";
import {
  Button,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useFormik } from "formik";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdNetworkAcl } from "types/network";
import { slugify } from "util/slugify";
import { useNavigate } from "react-router-dom";
import {
  GENERAL,
  YAML_CONFIGURATION,
} from "pages/networks/forms/NetworkFormMenu";
import FormFooterLayout from "components/forms/FormFooterLayout";
import YamlSwitch from "components/forms/YamlSwitch";
import FormSubmitBtn from "components/forms/FormSubmitBtn";
import ResourceLink from "components/ResourceLink";
import type { NetworkAclFormValues } from "types/forms/networkAcl";
import NetworkAclForm, {
  toNetworkAcl,
} from "pages/networks/forms/NetworkAclForm";
import { updateNetworkAcl } from "api/network-acls";
import { objectToYaml, yamlToObject } from "util/yaml";
import { useNetworkAclEntitlements } from "util/entitlements/network-acls";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  networkAcl: LxdNetworkAcl;
  project: string;
}

const EditNetworkAcl: FC<Props> = ({ networkAcl, project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [section, updateSection] = useState<string>(slugify(GENERAL));
  const { canEditNetworkAcl } = useNetworkAclEntitlements();

  const queryClient = useQueryClient();

  const initialValues: NetworkAclFormValues = {
    readOnly: true,
    isCreating: false,
    name: networkAcl.name,
    description: networkAcl.description,
    egress: networkAcl.egress,
    ingress: networkAcl.ingress,
    bareAcl: networkAcl,
    entityType: "network-acl",
    editRestriction: canEditNetworkAcl(networkAcl)
      ? undefined
      : "You do not have permission to edit this ACL",
  };

  const formik = useFormik<NetworkAclFormValues>({
    initialValues,
    enableReinitialize: true,
    onSubmit: (values) => {
      const saveObject = values.yaml
        ? (yamlToObject(values.yaml) as LxdNetworkAcl)
        : toNetworkAcl(formik.values, networkAcl);

      updateNetworkAcl(saveObject, project)
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              project,
              queryKeys.networkAcls,
              networkAcl.name,
            ],
          });

          toastNotify.success(
            <>
              Network ACL{" "}
              <ResourceLink
                type="network-acl"
                value={networkAcl.name}
                to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network-acl/${encodeURIComponent(networkAcl.name)}`}
              />{" "}
              updated.
            </>,
          );
        })
        .catch((e) => {
          notify.failure("ACL update failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
        });
    },
  });

  const baseUrl = `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network-acl/${encodeURIComponent(networkAcl.name)}`;

  const setSection = (newSection: string) => {
    if (newSection === GENERAL) {
      navigate(baseUrl);
    } else {
      navigate(`${baseUrl}/#${slugify(newSection)}`);
    }
    updateSection(slugify(newSection));
  };

  const getYaml = () => {
    const payload = toNetworkAcl(formik.values, networkAcl);
    return objectToYaml(payload);
  };

  const readOnly = formik.values.readOnly;

  return (
    <>
      <NetworkAclForm formik={formik} section={section} getYaml={getYaml} />
      <FormFooterLayout>
        <YamlSwitch
          formik={formik}
          section={section}
          setSection={() => {
            setSection(
              section === slugify(YAML_CONFIGURATION)
                ? GENERAL
                : YAML_CONFIGURATION,
            );
          }}
        />
        {readOnly ? null : (
          <>
            <Button
              appearance="base"
              onClick={() => {
                void formik.setValues(initialValues);
              }}
            >
              Cancel
            </Button>
            <FormSubmitBtn
              formik={formik}
              baseUrl={baseUrl}
              disabled={false}
              isYaml={section === slugify(YAML_CONFIGURATION)}
            />
          </>
        )}
      </FormFooterLayout>
    </>
  );
};

export default EditNetworkAcl;
