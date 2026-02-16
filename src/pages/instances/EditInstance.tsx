import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Row,
  useListener,
  useToastNotification,
} from "@canonical/react-components";
import { useFormik } from "formik";
import { updateInstance } from "api/instances";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { objectToYaml, yamlToObject } from "util/yaml";
import { useNavigate, useParams } from "react-router-dom";
import type { LxdInstance } from "types/instance";
import SecurityPoliciesForm from "components/forms/SecurityPoliciesForm";
import InstanceSnapshotsForm from "components/forms/InstanceSnapshotsForm";
import CloudInitForm from "components/forms/CloudInitForm";
import ResourceLimitsForm from "components/forms/ResourceLimitsForm";
import YamlForm from "components/forms/YamlForm";
import EditInstanceDetails from "pages/instances/forms/EditInstanceDetails";
import InstanceFormMenu, {
  BOOT,
  CLOUD_INIT,
  DISK_DEVICES,
  GPU_DEVICES,
  MAIN_CONFIGURATION,
  MIGRATION,
  NETWORK_DEVICES,
  OTHER_DEVICES,
  PROXY_DEVICES,
  RESOURCE_LIMITS,
  SECURITY_POLICIES,
  SNAPSHOTS,
  YAML_CONFIGURATION,
} from "pages/instances/forms/InstanceFormMenu";
import { updateMaxHeight } from "util/updateMaxHeight";
import DiskDeviceForm from "components/forms/DiskDeviceForm";
import NetworkDevicesForm from "components/forms/NetworkDevicesForm/NetworkDevicesForm";
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
import MigrationForm from "components/forms/MigrationForm";
import GPUDeviceForm from "components/forms/GPUDeviceForm";
import OtherDeviceForm from "components/forms/OtherDeviceForm";
import YamlSwitch from "components/forms/YamlSwitch";
import YamlNotification from "components/forms/YamlNotification";
import ProxyDeviceForm from "components/forms/ProxyDeviceForm";
import FormSubmitBtn from "components/forms/FormSubmitBtn";
import BootForm from "components/forms/BootForm";
import { useInstanceEntitlements } from "util/entitlements/instances";
import InstanceProfilesWarning from "./InstanceProfilesWarning";
import { useProfiles } from "context/useProfiles";
import usePanelParams, { panels } from "util/usePanelParams";
import NetworkDevicePanel from "components/forms/NetworkDevicesForm/edit/NetworkDevicePanel";
import { InstanceRichChip } from "./InstanceRichChip";
import { ROOT_PATH } from "util/rootPath";
import type { EditInstanceFormValues } from "types/forms/instanceAndProfile";

interface Props {
  instance: LxdInstance;
}

const EditInstance: FC<Props> = ({ instance }) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const { project, section } = useParams<{
    project: string;
    section?: string;
  }>();

  const panelParams = usePanelParams();
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
  useListener(window, updateFormHeight, "resize", true);

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
      const instanceLink = (
        <InstanceRichChip
          instanceName={instance.name}
          projectName={instance.project}
        />
      );

      updateInstance(instancePayload, project)
        .then((operation) => {
          eventQueue.set(
            operation.metadata.id,
            () => {
              toastNotify.success(<>Instance {instanceLink} updated.</>);
              formik.resetForm({
                values: getInstanceEditValues(instancePayload),
              });
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

  const baseUrl = `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/instance/${encodeURIComponent(instance.name)}/configuration`;

  const updateSection = (newSection: string) => {
    if (Boolean(formik.values.yaml) && newSection !== YAML_CONFIGURATION) {
      formik.setFieldValue("yaml", undefined);
    }

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
    return objectToYaml(bareInstance);
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
            formik={formik}
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
              <SecurityPoliciesForm
                formik={formik}
                setSection={updateSection}
              />
            )}

            {section === slugify(SNAPSHOTS) && (
              <InstanceSnapshotsForm formik={formik} />
            )}

            {section === slugify(MIGRATION) && (
              <MigrationForm formik={formik} />
            )}

            {section === slugify(BOOT) && <BootForm formik={formik} />}

            {section === slugify(CLOUD_INIT) && (
              <CloudInitForm
                key={`yaml-form-${version}`}
                formik={formik}
                project={project}
              />
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
                <YamlNotification entity="instance" docPath="/instances" />
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
                formik.resetForm({
                  values: getInstanceEditValues(instance),
                });
                setVersion((old) => old + 1);
              }}
            >
              Cancel
            </Button>
            <FormSubmitBtn
              formik={formik}
              baseUrl={baseUrl}
              isYaml={section === slugify(YAML_CONFIGURATION)}
              disabled={hasDiskError(formik) || hasNetworkError(formik)}
            />
          </>
        )}
      </FormFooterLayout>

      {(panelParams.panel === panels.editNetworkDevice ||
        panelParams.panel === panels.createNetworkDevice) && (
        <NetworkDevicePanel
          project={project}
          formik={formik}
          onSave={() => {
            ensureEditMode(formik);
          }}
        />
      )}
    </div>
  );
};

export default EditInstance;
