import React, { FC, useEffect, useState } from "react";
import { Col, Form, Notification, Row } from "@canonical/react-components";
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
import DevicesForm, {
  devicePayload,
  DevicesFormValues,
} from "pages/instances/forms/DevicesForm";
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
import { parseCpuLimit, parseMemoryLimit } from "util/limits";
import InstanceEditDetailsForm, {
  instanceEditDetailPayload,
  InstanceEditDetailsFormValues,
} from "pages/instances/forms/InstanceEditDetailsForm";
import InstanceFormMenu, {
  CLOUD_INIT,
  DEVICES,
  INSTANCE_DETAILS,
  RESOURCE_LIMITS,
  SECURITY_POLICIES,
  SNAPSHOTS,
  YAML_CONFIGURATION,
} from "pages/instances/forms/InstanceFormMenu";
import useEventListener from "@use-it/event-listener";

export type EditInstanceFormValues = InstanceEditDetailsFormValues &
  DevicesFormValues &
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
  const [isConfigOpen, setConfigOpen] = useState(false);

  if (!project) {
    return <>Missing project</>;
  }

  const InstanceSchema = Yup.object().shape({
    instanceType: Yup.string().required("Instance type is required"),
  });

  const updateFormHeight = () => {
    const elements = document.getElementsByClassName("form-contents");
    const belowElements = document.getElementsByClassName("p-bottom-controls");
    if (elements.length !== 1 || belowElements.length !== 1) {
      return;
    }
    const above = elements[0].getBoundingClientRect().top + 1;
    const below = belowElements[0].getBoundingClientRect().height + 1;
    const offset = Math.ceil(above + below);
    const style = `height: calc(100vh - ${offset}px)`;
    elements[0].setAttribute("style", style);
  };
  useEffect(updateFormHeight, [notify.notification?.message, section]);
  useEventListener("resize", updateFormHeight);

  const formik = useFormik<EditInstanceFormValues>({
    initialValues: {
      name: instance.name,
      description: instance.description,
      image: instance.config["image.description"],
      instanceType: instance.type,
      profiles: instance.profiles,

      devices: Object.keys(instance.devices).map((key) => {
        const item = instance.devices[key];
        switch (item.type) {
          case "nic":
            return {
              name: key,
              network: item.network,
              type: "nic",
            };
          case "disk":
            return {
              name: key,
              path: item.path,
              pool: item.pool,
              size: item.size,
              type: "disk",
            };
          default:
            return {
              type: "",
              name: "",
            };
        }
      }),

      limits_cpu: parseCpuLimit(instance.config["limits.cpu"]),
      limits_memory: parseMemoryLimit(instance.config["limits.memory"]),
      limits_memory_swap: instance.config["limits.memory.swap"],
      limits_disk_priority: instance.config["limits.disk.priority"]
        ? parseInt(instance.config["limits.disk.priority"])
        : undefined,
      limits_processes: instance.config["limits.processes"]
        ? parseInt(instance.config["limits.processes"])
        : undefined,

      security_protection_delete: instance.config["security.protection.delete"],
      security_privileged: instance.config["security.privileged"],
      security_protection_shift: instance.config["security.protection.shift"],
      security_idmap_base: instance.config["security.idmap.base"],
      security_idmap_size: instance.config["security.idmap.size"],
      security_idmap_isolated: instance.config["security.idmap.isolated"],
      security_devlxd: instance.config["security.devlxd"],
      security_devlxd_images: instance.config["security.devlxd.images"],
      security_secureboot: instance.config["security.secureboot"],
      snapshots_pattern: instance.config["snapshots.pattern"],
      snapshots_expiry: instance.config["snapshots.expiry"],
      snapshots_schedule: instance.config["snapshots.schedule"],
      snapshots_schedule_stopped: instance.config["snapshots.schedule.stopped"],
      ["cloud-init_network-config"]:
        instance.config["cloud-init.network-config"],
      ["cloud-init_user-data"]: instance.config["cloud-init.user-data"],
      ["cloud-init_vendor-data"]: instance.config["cloud-init.vendor-data"],
    },
    validationSchema: InstanceSchema,
    onSubmit: (values) => {
      const instancePayload = values.yaml
        ? yamlToObject(values.yaml)
        : getPayload(values);

      updateInstance(JSON.stringify(instancePayload), project)
        .then(() => {
          notify.success("Saved.");
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
    const isVm = values.instanceType === "virtual-machine";
    return {
      ...instanceEditDetailPayload(values),
      ...devicePayload(values),
      config: {
        ...resourceLimitsPayload(values, isVm),
        ...securityPoliciesPayload(values, isVm),
        ...snapshotsPayload(values),
        ...cloudInitPayload(values),
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

  const overrideNotification = (
    <Notification severity="caution" title="Before you add configurations">
      The custom configuration overrides any settings specified through
      profiles.
    </Notification>
  );

  return (
    <div className="edit-instance-form">
      <Form
        onSubmit={() => void formik.submitForm()}
        stacked
        className="instance-form"
      >
        <InstanceFormMenu
          active={section}
          setActive={updateSection}
          isConfigOpen={isConfigOpen}
          toggleConfigOpen={toggleMenu}
        />
        <Row className="form-contents" key={section}>
          <Col size={12}>
            {section === INSTANCE_DETAILS && (
              <InstanceEditDetailsForm formik={formik} project={project} />
            )}

            {section === DEVICES && (
              <DevicesForm formik={formik} project={project}>
                {overrideNotification}
              </DevicesForm>
            )}

            {section === RESOURCE_LIMITS && (
              <ResourceLimitsForm formik={formik}>
                {overrideNotification}
              </ResourceLimitsForm>
            )}

            {section === SECURITY_POLICIES && (
              <SecurityPoliciesForm formik={formik}>
                {overrideNotification}
              </SecurityPoliciesForm>
            )}

            {section === SNAPSHOTS && (
              <SnapshotsForm formik={formik}>
                {overrideNotification}
              </SnapshotsForm>
            )}

            {section === CLOUD_INIT && <CloudInitForm formik={formik} />}

            {section === YAML_CONFIGURATION && (
              <YamlForm
                yaml={getYaml()}
                setYaml={(yaml) => void formik.setFieldValue("yaml", yaml)}
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
            <SubmitButton
              isSubmitting={formik.isSubmitting}
              isDisabled={!formik.isValid || !formik.values.image}
              buttonLabel="Save changes"
              onClick={() => void formik.submitForm()}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EditInstanceForm;
