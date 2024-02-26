import React, { FC, useEffect, useState } from "react";
import {
  ActionButton,
  Button,
  Col,
  Form,
  Notification,
  Row,
} from "@canonical/react-components";
import { useFormik } from "formik";
import { updateInstance } from "api/instances";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { dump as dumpYaml } from "js-yaml";
import { yamlToObject } from "util/yaml";
import { useNavigate, useParams } from "react-router-dom";
import { LxdInstance } from "types/instance";
import { FormDeviceValues } from "util/formDevices";
import SecurityPoliciesForm, {
  SecurityPoliciesFormValues,
} from "components/forms/SecurityPoliciesForm";
import InstanceSnapshotsForm, {
  SnapshotFormValues,
} from "components/forms/InstanceSnapshotsForm";
import CloudInitForm, {
  CloudInitFormValues,
} from "components/forms/CloudInitForm";
import ResourceLimitsForm, {
  ResourceLimitsFormValues,
} from "components/forms/ResourceLimitsForm";
import YamlForm, { YamlFormValues } from "components/forms/YamlForm";
import EditInstanceDetails from "pages/instances/forms/EditInstanceDetails";
import InstanceFormMenu, {
  CLOUD_INIT,
  MAIN_CONFIGURATION,
  NETWORK_DEVICES,
  RESOURCE_LIMITS,
  SECURITY_POLICIES,
  SNAPSHOTS,
  DISK_DEVICES,
  YAML_CONFIGURATION,
} from "pages/instances/forms/InstanceFormMenu";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import DiskDeviceForm from "components/forms/DiskDeviceForm";
import NetworkDevicesForm from "components/forms/NetworkDevicesForm";
import {
  getInstanceEditValues,
  getInstancePayload,
  InstanceEditSchema,
} from "util/instanceEdit";
import { slugify } from "util/slugify";
import { useEventQueue } from "context/eventQueue";
import { hasDiskError, hasNetworkError } from "util/instanceValidation";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";
import InstanceLink from "pages/instances/InstanceLink";
import { useDocs } from "context/useDocs";

export interface InstanceEditDetailsFormValues {
  name: string;
  description?: string;
  instanceType: string;
  location: string;
  profiles: string[];
  entityType: "instance";
  readOnly: boolean;
}

export type EditInstanceFormValues = InstanceEditDetailsFormValues &
  FormDeviceValues &
  ResourceLimitsFormValues &
  SecurityPoliciesFormValues &
  SnapshotFormValues &
  CloudInitFormValues &
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
  const [isConfigOpen, setConfigOpen] = useState(true);

  if (!project) {
    return <>Missing project</>;
  }

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [section]);
  useEventListener("resize", updateFormHeight);

  const formik = useFormik<EditInstanceFormValues>({
    initialValues: getInstanceEditValues(instance),
    validationSchema: InstanceEditSchema,
    onSubmit: (values) => {
      const instancePayload = (
        values.yaml
          ? yamlToObject(values.yaml)
          : getInstancePayload(instance, values)
      ) as LxdInstance;

      // ensure the etag is set (it is missing on the yaml)
      instancePayload.etag = instance.etag;
      const instanceLink = <InstanceLink instance={instance} />;

      void updateInstance(instancePayload, project)
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
              void queryClient.invalidateQueries({
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
      void formik.setFieldValue("yaml", undefined);
    }

    const baseUrl = `/ui/project/${project}/instance/${instance.name}/configuration`;
    newSection === MAIN_CONFIGURATION
      ? navigate(baseUrl)
      : navigate(`${baseUrl}/${slugify(newSection)}`);
  };

  const toggleMenu = () => {
    setConfigOpen((old) => !old);
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
        <InstanceFormMenu
          active={section ?? slugify(MAIN_CONFIGURATION)}
          setActive={updateSection}
          isConfigDisabled={false}
          isConfigOpen={isConfigOpen}
          toggleConfigOpen={toggleMenu}
          hasDiskError={hasDiskError(formik)}
          hasNetworkError={hasNetworkError(formik)}
          formik={formik}
        />
        <Row className="form-contents" key={section}>
          <Col size={12}>
            {(section === slugify(MAIN_CONFIGURATION) || !section) && (
              <EditInstanceDetails formik={formik} project={project} />
            )}

            {section === slugify(DISK_DEVICES) && (
              <DiskDeviceForm formik={formik} project={project} />
            )}

            {section === slugify(NETWORK_DEVICES) && (
              <NetworkDevicesForm formik={formik} project={project} />
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

            {section === slugify(CLOUD_INIT) && (
              <CloudInitForm formik={formik} />
            )}

            {section === slugify(YAML_CONFIGURATION) && (
              <YamlForm
                key={`yaml-form-${formik.values.readOnly}`}
                yaml={getYaml()}
                setYaml={(yaml) => void formik.setFieldValue("yaml", yaml)}
                readOnly={readOnly}
              >
                <Notification severity="information" title="YAML Configuration">
                  This is the YAML representation of the instance.
                  <br />
                  <a
                    href={`${docBaseLink}/instances`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more about instances
                  </a>
                </Notification>
              </YamlForm>
            )}
          </Col>
        </Row>
      </Form>
      <FormFooterLayout>
        {readOnly ? (
          <Button
            appearance="positive"
            onClick={() => {
              void formik.setFieldValue("readOnly", false);
            }}
          >
            Edit instance
          </Button>
        ) : (
          <>
            <Button
              appearance="base"
              onClick={() => formik.setValues(getInstanceEditValues(instance))}
            >
              Cancel
            </Button>
            <ActionButton
              appearance="positive"
              loading={formik.isSubmitting}
              disabled={
                !formik.isValid ||
                hasDiskError(formik) ||
                hasNetworkError(formik)
              }
              onClick={() => void formik.submitForm()}
            >
              Save changes
            </ActionButton>
          </>
        )}
      </FormFooterLayout>
    </div>
  );
};

export default EditInstance;
