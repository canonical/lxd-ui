import React, { FC, useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Notification,
  Row,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateInstance } from "api/instances";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import { dump as dumpYaml } from "js-yaml";
import { yamlToObject } from "util/yaml";
import { useParams } from "react-router-dom";
import { LxdInstance } from "types/instance";
import { useNotify } from "context/notify";
import { formDeviceToPayload, FormDeviceValues } from "util/formDevices";
import SecurityPoliciesForm, {
  SecurityPoliciesFormValues,
  securityPoliciesPayload,
} from "pages/instances/forms/SecurityPoliciesForm";
import SnapshotsForm, {
  SnapshotFormValues,
  snapshotsPayload,
} from "pages/instances/forms/SnapshotsForm";
import CloudInitForm, {
  CloudInitFormValues,
  cloudInitPayload,
} from "pages/instances/forms/CloudInitForm";
import ResourceLimitsForm, {
  ResourceLimitsFormValues,
  resourceLimitsPayload,
} from "pages/instances/forms/ResourceLimitsForm";
import YamlForm, { YamlFormValues } from "pages/instances/forms/YamlForm";
import InstanceEditDetailsForm, {
  instanceEditDetailPayload,
  InstanceEditDetailsFormValues,
} from "pages/instances/forms/InstanceEditDetailsForm";
import InstanceFormMenu, {
  CLOUD_INIT,
  STORAGE,
  INSTANCE_DETAILS,
  RESOURCE_LIMITS,
  SECURITY_POLICIES,
  SNAPSHOTS,
  YAML_CONFIGURATION,
  NETWORKS,
} from "pages/instances/forms/InstanceFormMenu";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";
import RootStorageForm from "pages/instances/forms/RootStorageForm";
import NetworkForm from "pages/instances/forms/NetworkForm";
import { getEditValues } from "util/formFields";

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
  const { project } = useParams<{ project: string }>();
  const queryClient = useQueryClient();
  const [section, setSection] = useState(INSTANCE_DETAILS);
  const [isConfigOpen, setConfigOpen] = useState(true);

  if (!project) {
    return <>Missing project</>;
  }

  const InstanceSchema = Yup.object().shape({
    name: Yup.string().required("Instance name is required"),
    instanceType: Yup.string().required("Instance type is required"),
  });

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  const initialValues = {
    instanceType: instance.type,
    profiles: instance.profiles,
    type: "instance",
    readOnly: true,
    ...getEditValues(instance),
  };

  const formik = useFormik<EditInstanceFormValues>({
    initialValues: initialValues,
    validationSchema: InstanceSchema,
    onSubmit: (values) => {
      const instancePayload = values.yaml
        ? yamlToObject(values.yaml)
        : getPayload(values);

      updateInstance(JSON.stringify(instancePayload), project, instance.etag)
        .then(() => {
          notify.success("Saved.");
          void formik.setFieldValue("readOnly", true);
        })
        .catch((e: Error) => {
          notify.failure("Could not save", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.instances],
          });
        });
    },
  });

  const getPayload = (values: EditInstanceFormValues) => {
    const volatileKeys = Object.fromEntries(
      Object.entries(instance.config).filter(([key]) =>
        key.startsWith("volatile.")
      )
    );

    return {
      ...instanceEditDetailPayload(values),
      devices: formDeviceToPayload(values.devices),
      config: {
        ...resourceLimitsPayload(values),
        ...securityPoliciesPayload(values),
        ...snapshotsPayload(values),
        ...cloudInitPayload(values),
        ...volatileKeys,
      },
    };
  };

  const updateSection = (newItem: string) => {
    if (section === YAML_CONFIGURATION && newItem !== YAML_CONFIGURATION) {
      void formik.setFieldValue("yaml", undefined);
    }
    setSection(newItem);
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
          active={section}
          setActive={updateSection}
          isConfigDisabled={false}
          isConfigOpen={isConfigOpen}
          toggleConfigOpen={toggleMenu}
        />
        <Row className="form-contents" key={section}>
          <Col size={12}>
            {section === INSTANCE_DETAILS && (
              <InstanceEditDetailsForm formik={formik} project={project} />
            )}

            {section === STORAGE && (
              <RootStorageForm formik={formik} project={project} />
            )}

            {section === NETWORKS && (
              <NetworkForm formik={formik} project={project} />
            )}

            {section === RESOURCE_LIMITS && (
              <ResourceLimitsForm formik={formik} />
            )}

            {section === SECURITY_POLICIES && (
              <SecurityPoliciesForm formik={formik} />
            )}

            {section === SNAPSHOTS && <SnapshotsForm formik={formik} />}

            {section === CLOUD_INIT && <CloudInitForm formik={formik} />}

            {section === YAML_CONFIGURATION && (
              <YamlForm
                yaml={getYaml()}
                setYaml={(yaml) => void formik.setFieldValue("yaml", yaml)}
                isReadOnly={isReadOnly}
              >
                <Notification
                  severity="caution"
                  title="Before you edit the YAML"
                >
                  Changes will be discarded, when switching back to the guided
                  forms.
                </Notification>
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
                <Button onClick={() => formik.setValues(initialValues)}>
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
