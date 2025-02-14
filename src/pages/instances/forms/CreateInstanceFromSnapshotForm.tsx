import { FC, useState } from "react";
import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import { useFormik } from "formik";
import { useToastNotification } from "context/toastNotificationProvider";
import {
  ActionButton,
  Button,
  Form,
  Input,
  Modal,
  Select,
} from "@canonical/react-components";
import * as Yup from "yup";
import { createInstance } from "api/instances";
import { isClusteredServer } from "util/settings";
import { useSettings } from "context/useSettings";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchStoragePools } from "api/storage-pools";
import { instanceNameValidation, truncateInstanceName } from "util/instances";
import type { LxdDiskDevice } from "types/device";
import { useEventQueue } from "context/eventQueue";
import ClusterMemberSelector from "pages/cluster/ClusterMemberSelector";
import ResourceLabel from "components/ResourceLabel";
import InstanceLinkChip from "../InstanceLinkChip";
import { InstanceIconType } from "components/ResourceIcon";
import { useInstances } from "context/useInstances";
import { useProjects } from "context/useProjects";
import { useProjectEntitlements } from "util/entitlements/projects";

interface Props {
  instance: LxdInstance;
  snapshot: LxdInstanceSnapshot;
  close: () => void;
}

interface CreateInstanceFromSnapshotValues {
  instanceName: string;
  targetProject: string;
  targetClusterMember?: string;
  targetStoragePool: string;
  stateful: boolean;
}

const instanceFromSnapshotPayload = (
  values: CreateInstanceFromSnapshotValues,
  instance: LxdInstance,
  snapshot: LxdInstanceSnapshot,
) => {
  const basePayload: Record<string, unknown> = {
    name: values.instanceName,
    description: instance.description,
    architecture: instance.architecture,
    ephemeral: snapshot.ephemeral,
    mode: "pull",
    devices: {
      ...instance.devices,
      root: {
        path: "/",
        type: "disk",
        pool: values.targetStoragePool,
      },
    },
  };

  const source: Record<string, unknown> = {
    project: instance.project,
    type: "copy",
    source: `${instance.name}/${snapshot.name}`,
    base_image: snapshot.config["volatile.base_image"] ?? "",
  };

  if (snapshot.stateful && values.stateful) {
    basePayload["stateful"] = true;
    source["live"] = false;
  }

  return {
    ...basePayload,
    source,
  };
};

const CreateInstanceFromSnapshotForm: FC<Props> = ({
  instance,
  snapshot,
  close,
}) => {
  const toastNotify = useToastNotification();
  const { data: settings } = useSettings();
  const isClustered = isClusteredServer(settings);
  const controllerState = useState<AbortController | null>(null);
  const eventQueue = useEventQueue();

  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { canCreateInstances } = useProjectEntitlements();

  const { data: storagePools = [], isLoading: storagePoolsLoading } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStoragePools(),
  });

  const { data: instances = [] } = useInstances(instance.project);

  const notifySuccess = (
    name: string,
    project: string,
    type: InstanceIconType,
  ) => {
    const instanceLink = (
      <InstanceLinkChip instance={{ name, project, type }} />
    );

    const message = <>Created instance {instanceLink}.</>;
    toastNotify.success(message);
  };

  const getNewInstanceName = (instance: LxdInstance): string => {
    const instanceNames = instances.map((instance) => instance.name);
    const newInstanceName = truncateInstanceName(
      instance.name,
      `-${snapshot.name}-copy`,
    );

    if (instanceNames.includes(newInstanceName)) {
      let count = 1;
      while (instanceNames.includes(`${newInstanceName}-${count}`)) {
        count++;
      }
      return `${newInstanceName}-${count}`;
    }

    return newInstanceName;
  };

  const validate = (values: CreateInstanceFromSnapshotValues) => {
    const errors: Partial<CreateInstanceFromSnapshotValues> = {};
    if (values.stateful) {
      if (values.targetProject === instance.project) {
        errors.targetProject =
          "Stateful instance snapshot duplication must be in a different project";
      }

      if (values.instanceName !== instance.name) {
        errors.instanceName =
          "Instance name must be the same for stateful duplication";
      }
    }

    return errors;
  };

  const formik = useFormik<CreateInstanceFromSnapshotValues>({
    initialValues: {
      instanceName: getNewInstanceName(instance),
      targetProject: instance.project,
      stateful: false,
      targetClusterMember: isClustered ? instance.location : "",
      targetStoragePool:
        (instance.devices["root"] as LxdDiskDevice)?.pool ??
        storagePools[0]?.name,
    },
    enableReinitialize: true,
    validate,
    validationSchema: Yup.object().shape({
      instanceName: instanceNameValidation(
        instance.project,
        controllerState,
        instance.name,
      ).required(),
    }),

    onSubmit: (values) => {
      const instanceLink = <InstanceLinkChip instance={instance} />;
      createInstance(
        JSON.stringify(instanceFromSnapshotPayload(values, instance, snapshot)),
        values.targetProject,
        values.targetClusterMember,
      )
        .then((operation) => {
          toastNotify.info(
            <>
              Instance creation started for{" "}
              <ResourceLabel
                bold
                type={instance.type}
                value={values.instanceName}
              />
              .
            </>,
          );
          eventQueue.set(
            operation.metadata.id,
            () =>
              notifySuccess(
                values.instanceName,
                values.targetProject,
                instance.type,
              ),
            (msg) =>
              toastNotify.failure(
                "Instance creation failed.",
                new Error(msg),
                instanceLink,
              ),
          );
        })
        .catch((e) => {
          toastNotify.failure("Instance creation failed.", e, instanceLink);
        })
        .finally(() => {
          close();
        });
    },
  });

  return (
    <Modal
      close={close}
      className="create-instance-from-snapshot-modal"
      title="Create instance from snapshot"
      buttonRow={
        <>
          <Button
            appearance="base"
            className="u-no-margin--bottom"
            type="button"
            onClick={close}
          >
            Cancel
          </Button>
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            loading={formik.isSubmitting}
            disabled={!formik.isValid || storagePoolsLoading || projectsLoading}
            onClick={() => void formik.submitForm()}
          >
            Create
          </ActionButton>
        </>
      }
    >
      <Form onSubmit={formik.handleSubmit}>
        <Input
          type="text"
          label="Snapshot name"
          disabled
          value={snapshot.name}
        />
        <Input
          {...formik.getFieldProps("instanceName")}
          type="text"
          label="New instance name"
          error={formik.errors.instanceName}
        />
        <ClusterMemberSelector
          {...formik.getFieldProps("targetClusterMember")}
          id="targetClusterMember"
          label="Target cluster member"
        />
        <Select
          {...formik.getFieldProps("targetStoragePool")}
          id="storagePool"
          label="Storage pool"
          options={storagePools.map((storagePool) => {
            return {
              label: storagePool.name,
              value: storagePool.name,
            };
          })}
        />
        <Select
          {...formik.getFieldProps("targetProject")}
          id="project"
          label="Target project"
          options={projects.filter(canCreateInstances).map((project) => {
            return {
              label: project.name,
              value: project.name,
            };
          })}
          error={formik.errors.targetProject}
        />
        {snapshot.stateful && (
          <Input
            {...formik.getFieldProps("stateful")}
            type="checkbox"
            label="Copy stateful"
          />
        )}
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
      </Form>
    </Modal>
  );
};

export default CreateInstanceFromSnapshotForm;
