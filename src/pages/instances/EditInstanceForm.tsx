import React, { FC, useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Notification,
  NotificationType,
  Row,
  failure,
  success,
  useNotify,
} from "@canonical/react-components";
import { useFormik } from "formik";
import { updateInstance } from "api/instances";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import { dump as dumpYaml } from "js-yaml";
import { yamlToObject } from "util/yaml";
import { useNavigate, useParams } from "react-router-dom";
import { LxdInstance } from "types/instance";
import NotificationRowLegacy from "components/NotificationRowLegacy";
import { FormDeviceValues } from "util/formDevices";
import SecurityPoliciesForm, {
  SecurityPoliciesFormValues,
} from "pages/instances/forms/SecurityPoliciesForm";
import SnapshotsForm, {
  SnapshotFormValues,
} from "pages/instances/forms/SnapshotsForm";
import CloudInitForm, {
  CloudInitFormValues,
} from "pages/instances/forms/CloudInitForm";
import ResourceLimitsForm, {
  ResourceLimitsFormValues,
} from "pages/instances/forms/ResourceLimitsForm";
import YamlForm, { YamlFormValues } from "pages/instances/forms/YamlForm";
import InstanceEditDetailsForm, {
  InstanceEditDetailsFormValues,
} from "pages/instances/forms/InstanceEditDetailsForm";
import InstanceFormMenu, {
  CLOUD_INIT,
  INSTANCE_DETAILS,
  NETWORKS,
  RESOURCE_LIMITS,
  SECURITY_POLICIES,
  SNAPSHOTS,
  STORAGE,
  YAML_CONFIGURATION,
} from "pages/instances/forms/InstanceFormMenu";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import RootStorageForm from "pages/instances/forms/RootStorageForm";
import NetworkForm from "pages/instances/forms/NetworkForm";
import {
  getInstanceEditValues,
  getInstancePayload,
  InstanceEditSchema,
} from "util/instanceEdit";
import { slugify } from "util/slugify";

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

const EditInstanceForm: FC<Props> = ({ instance }) => {
  const notify = useNotify();
  const { project, activeSection } = useParams<{
    project: string;
    activeSection?: string;
  }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isConfigOpen, setConfigOpen] = useState(true);
  const [inTabNotification, setInTabNotification] =
    useState<NotificationType | null>(null);

  if (!project) {
    return <>Missing project</>;
  }

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, activeSection]);
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

      updateInstance(instancePayload, project)
        .then(() => {
          setInTabNotification(success("Instance updated."));
          void formik.setValues(getInstanceEditValues(instancePayload));
        })
        .catch((e: Error) => {
          setInTabNotification(failure("Instance update failed", e));
        })
        .finally(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.instances],
          });
        });
    },
  });

  const updateSection = (newSection: string) => {
    if (Boolean(formik.values.yaml) && newSection !== YAML_CONFIGURATION) {
      void formik.setFieldValue("yaml", undefined);
    }

    const baseUrl = `/ui/project/${project}/instances/detail/${instance.name}/configuration`;
    newSection === INSTANCE_DETAILS
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
      Object.entries(instance).filter((e) => !exclude.has(e[0]))
    );
    return dumpYaml(bareInstance);
  };

  const isReadOnly = formik.values.readOnly;

  return (
    <div className="edit-instance">
      <Form onSubmit={() => void formik.submitForm()} stacked className="form">
        <InstanceFormMenu
          active={activeSection ?? slugify(INSTANCE_DETAILS)}
          setActive={updateSection}
          isConfigDisabled={false}
          isConfigOpen={isConfigOpen}
          toggleConfigOpen={toggleMenu}
        />
        <Row className="form-contents" key={activeSection}>
          <NotificationRowLegacy
            notification={inTabNotification}
            onDismiss={() => setInTabNotification(null)}
          />
          <Col size={12}>
            {(activeSection === slugify(INSTANCE_DETAILS) ||
              !activeSection) && (
              <InstanceEditDetailsForm
                formik={formik}
                project={project}
                setInTabNotification={setInTabNotification}
              />
            )}

            {activeSection === slugify(STORAGE) && (
              <RootStorageForm formik={formik} project={project} />
            )}

            {activeSection === slugify(NETWORKS) && (
              <NetworkForm formik={formik} project={project} />
            )}

            {activeSection === slugify(RESOURCE_LIMITS) && (
              <ResourceLimitsForm formik={formik} />
            )}

            {activeSection === slugify(SECURITY_POLICIES) && (
              <SecurityPoliciesForm formik={formik} />
            )}

            {activeSection === slugify(SNAPSHOTS) && (
              <SnapshotsForm formik={formik} />
            )}

            {activeSection === slugify(CLOUD_INIT) && (
              <CloudInitForm formik={formik} />
            )}

            {activeSection === slugify(YAML_CONFIGURATION) && (
              <YamlForm
                yaml={getYaml()}
                setYaml={(yaml) => void formik.setFieldValue("yaml", yaml)}
                isReadOnly={isReadOnly}
              >
                {!isReadOnly && (
                  <Notification
                    severity="caution"
                    title="Before you edit the YAML"
                  >
                    Changes will be discarded, when switching back to the guided
                    forms.
                  </Notification>
                )}
              </YamlForm>
            )}
          </Col>
        </Row>
      </Form>
      <div className="p-bottom-controls">
        <hr />
        <Row className="u-align--right">
          <Col size={12}>
            {isReadOnly ? (
              <Button
                appearance="positive"
                onClick={() => formik.setFieldValue("readOnly", false)}
              >
                Edit instance
              </Button>
            ) : (
              <>
                <Button
                  onClick={() =>
                    formik.setValues(getInstanceEditValues(instance))
                  }
                >
                  Cancel
                </Button>
                <SubmitButton
                  isSubmitting={formik.isSubmitting}
                  isDisabled={!formik.isValid}
                  buttonLabel="Save changes"
                  onClick={() => void formik.submitForm()}
                />
              </>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EditInstanceForm;
