import type { FC } from "react";
import { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "@canonical/react-components";
import { useFormik } from "formik";
import { updateInstance } from "api/instances";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { dump as dumpYaml } from "js-yaml";
import { yamlToObject } from "util/yaml";
import { useNavigate, useParams } from "react-router-dom";
import type { LxdInstance } from "types/instance";
import type { FormDeviceValues } from "util/formDevices";
import type { SecurityPoliciesFormValues } from "components/forms/SecurityPoliciesForm";
import SecurityPoliciesForm from "components/forms/SecurityPoliciesForm";
import type { SnapshotFormValues } from "components/forms/InstanceSnapshotsForm";
import InstanceSnapshotsForm from "components/forms/InstanceSnapshotsForm";
import type { CloudInitFormValues } from "components/forms/CloudInitForm";
import CloudInitForm from "components/forms/CloudInitForm";
import type { ResourceLimitsFormValues } from "components/forms/ResourceLimitsForm";
import ResourceLimitsForm from "components/forms/ResourceLimitsForm";
import type { YamlFormValues } from "components/forms/YamlForm";
import YamlForm from "components/forms/YamlForm";
import EditInstanceDetails from "pages/instances/forms/EditInstanceDetails";
import InstanceFormMenu, {
  BOOT,
  CLOUD_INIT,
  DISK_DEVICES,
  MAIN_CONFIGURATION,
  MIGRATION,
  NETWORK_DEVICES,
  RESOURCE_LIMITS,
  SECURITY_POLICIES,
  SNAPSHOTS,
  YAML_CONFIGURATION,
  GPU_DEVICES,
  OTHER_DEVICES,
  PROXY_DEVICES,
} from "pages/instances/forms/InstanceFormMenu";
import useEventListener from "util/useEventListener";
import { updateMaxHeight } from "util/updateMaxHeight";
import DiskDeviceForm from "components/forms/DiskDeviceForm";
import NetworkDevicesForm from "components/forms/NetworkDevicesForm";
import {
  ensureEditMode,
  getInstanceEditValues,
  getInstancePayload,
  InstanceEditSchema,
} from "util/instanceEdit";
import { slugify } from "util/slugify";
import { useEventQueue } from "context/eventQueue";
import { hasDiskError, hasNetworkError } from "util/instanceValidation";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";
import { useDocs } from "context/useDocs";
import type { MigrationFormValues } from "components/forms/MigrationForm";
import MigrationForm from "components/forms/MigrationForm";
import GPUDeviceForm from "components/forms/GPUDeviceForm";
import OtherDeviceForm from "components/forms/OtherDeviceForm";
import YamlSwitch from "components/forms/YamlSwitch";
import YamlNotification from "components/forms/YamlNotification";
import ProxyDeviceForm from "components/forms/ProxyDeviceForm";
import FormSubmitBtn from "components/forms/FormSubmitBtn";
import InstanceLinkChip from "./InstanceLinkChip";
import type { BootFormValues } from "components/forms/BootForm";
import BootForm from "components/forms/BootForm";
import { useInstanceEntitlements } from "util/entitlements/instances";
import InstanceProfilesWarning from "./InstanceProfilesWarning";
import { useProfiles } from "context/useProfiles";
import type { SshKeyFormValues } from "components/forms/SshKeyForm";

export interface InstanceEditDetailsFormValues {
  name: string;
  description?: string;
  instanceType: string;
  location: string;
  profiles: string[];
  entityType: "instance";
  isCreating: boolean;
  readOnly: boolean;
  editRestriction?: string;
}

export type EditInstanceFormValues = InstanceEditDetailsFormValues &
  FormDeviceValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  MigrationFormValues &
  BootFormValues &
  CloudInitFormValues &
  SshKeyFormValues &
  YamlFormValues;

interface Props {
  instance: LxdInstance;
}

const EditInstance: FC<Props> = ({ instance }) => {
  const docBaseLink = useDocs();
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const { project, section } = useParams<{
    project: string;
    section?: string;
  }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const { canEditInstance } = useInstanceEntitlements();

  if (!project) {
    return <>Missing project</>;
  }

  const { data: profiles = [] } = useProfiles(project);

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [section]);
  useEventListener("resize", updateFormHeight);

  const editRestriction = canEditInstance(instance)
    ? undefined
    : "You do not have permission to edit this instance";

  const formik = useFormik<EditInstanceFormValues>({
    initialValues: getInstanceEditValues(instance, editRestriction),
    validationSchema: InstanceEditSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const instancePayload = (
        values.yaml
          ? yamlToObject(values.yaml)
          : getInstancePayload(instance, values)
      ) as LxdInstance;

      // ensure the etag is set (it is missing on the yaml)
      instancePayload.etag = instance.etag;
      const instanceLink = <InstanceLinkChip instance={instance} />;

      updateInstance(instancePayload, project)
        .then((operation) => {
          eventQueue.set(
            operation.metadata.id,
            () => {
              toastNotify.success(<>Instance {instanceLink} updated.</>);
              void formik.setValues(getInstanceEditValues(instancePayload));
            },
            (msg) =>
              toastNotify.failure(
                "Instance update failed.",
                new Error(msg),
                instanceLink,
              ),
            () => {
              formik.setSubmitting(false);
              queryClient.invalidateQueries({
                queryKey: [queryKeys.instances],
              });
            },
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          toastNotify.failure("Instance update failed.", e, instanceLink);
        });
    },
  });

  const updateSection = (newSection: string) => {
    if (Boolean(formik.values.yaml) && newSection !== YAML_CONFIGURATION) {
      formik.setFieldValue("yaml", undefined);
    }

    const baseUrl = `/ui/project/${project}/instance/${instance.name}/configuration`;
    if (newSection === MAIN_CONFIGURATION) {
      navigate(baseUrl);
    } else {
      navigate(`${baseUrl}/${slugify(newSection)}`);
    }
  };

  const getYaml = () => {
    const exclude = new Set([
      "backups",
      "snapshots",
      "state",
      "expanded_config",
      "expanded_devices",
      "etag",
    ]);
    const bareInstance = Object.fromEntries(
      Object.entries(instance).filter((e) => !exclude.has(e[0])),
    );
    return dumpYaml(bareInstance);
  };

  const readOnly = formik.values.readOnly;

  return (
    <div className="edit-instance">
      <Form onSubmit={formik.handleSubmit} className="form">
        {section !== slugify(YAML_CONFIGURATION) && (
          <InstanceFormMenu
            active={section ?? slugify(MAIN_CONFIGURATION)}
            setActive={updateSection}
            isDisabled={false}
            hasDiskError={hasDiskError(formik)}
            hasNetworkError={hasNetworkError(formik)}
          />
        )}
        <Row className="form-contents" key={section}>
          <Col size={12}>
            {section !== slugify(YAML_CONFIGURATION) && (
              <InstanceProfilesWarning
                instanceProfiles={instance.profiles}
                profiles={profiles}
              />
            )}
            {(section === slugify(MAIN_CONFIGURATION) || !section) && (
              <EditInstanceDetails formik={formik} project={project} />
            )}

            {section === slugify(DISK_DEVICES) && (
              <DiskDeviceForm formik={formik} project={project} />
            )}

            {section === slugify(NETWORK_DEVICES) && (
              <NetworkDevicesForm formik={formik} project={project} />
            )}

            {section === slugify(GPU_DEVICES) && (
              <GPUDeviceForm formik={formik} project={project} />
            )}

            {section === slugify(PROXY_DEVICES) && (
              <ProxyDeviceForm formik={formik} project={project} />
            )}

            {section === slugify(OTHER_DEVICES) && (
              <OtherDeviceForm formik={formik} project={project} />
            )}

            {section === slugify(RESOURCE_LIMITS) && (
              <ResourceLimitsForm formik={formik} />
            )}

            {section === slugify(SECURITY_POLICIES) && (
              <SecurityPoliciesForm formik={formik} />
            )}

            {section === slugify(SNAPSHOTS) && (
              <InstanceSnapshotsForm formik={formik} />
            )}

            {section === slugify(MIGRATION) && (
              <MigrationForm formik={formik} />
            )}

            {section === slugify(BOOT) && <BootForm formik={formik} />}

            {section === slugify(CLOUD_INIT) && (
              <CloudInitForm key={`yaml-form-${version}`} formik={formik} />
            )}

            {section === slugify(YAML_CONFIGURATION) && (
              <YamlForm
                key={`yaml-form-${version}`}
                yaml={getYaml()}
                setYaml={(yaml) => {
                  ensureEditMode(formik);
                  formik.setFieldValue("yaml", yaml);
                }}
                readOnly={!!formik.values.editRestriction}
                readOnlyMessage={formik.values.editRestriction}
              >
                <YamlNotification
                  entity="instance"
                  href={`${docBaseLink}/instances`}
                />
              </YamlForm>
            )}
          </Col>
        </Row>
      </Form>
      <FormFooterLayout>
        <YamlSwitch
          formik={formik}
          section={section}
          setSection={updateSection}
        />
        {readOnly ? null : (
          <>
            <Button
              appearance="base"
              onClick={() => {
                void formik.setValues(getInstanceEditValues(instance));
                setVersion((old) => old + 1);
              }}
            >
              Cancel
            </Button>
            <FormSubmitBtn
              formik={formik}
              isYaml={section === slugify(YAML_CONFIGURATION)}
              disabled={hasDiskError(formik) || hasNetworkError(formik)}
            />
          </>
        )}
      </FormFooterLayout>
    </div>
  );
};

export default EditInstance;
