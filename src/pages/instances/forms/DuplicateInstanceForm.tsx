import { FC, useState } from "react";
import { LxdInstance } from "types/instance";
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
import { createInstance, fetchInstances } from "api/instances";
import { isClusteredServer } from "util/settings";
import { useSettings } from "context/useSettings";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchStoragePools } from "api/storage-pools";
import { useNavigate } from "react-router-dom";
import { instanceNameValidation, truncateInstanceName } from "util/instances";
import { fetchProjects } from "api/projects";
import { LxdDiskDevice } from "types/device";
import InstanceLink from "pages/instances/InstanceLink";
import { useEventQueue } from "context/eventQueue";
import ClusterMemberSelector from "pages/cluster/ClusterMemberSelector";
import { getUniqueResourceName } from "util/helpers";

interface Props {
  instance: LxdInstance;
  close: () => void;
}

export interface LxdInstanceDuplicate {
  instanceName: string;
  targetProject: string;
  targetClusterMember?: string;
  targetStoragePool: string;
  allowInconsistent: boolean;
  instanceOnly: boolean;
  stateful: boolean;
}

const DuplicateInstanceForm: FC<Props> = ({ instance, close }) => {
  const toastNotify = useToastNotification();
  const { data: settings } = useSettings();
  const isClustered = isClusteredServer(settings);
  const controllerState = useState<AbortController | null>(null);
  const navigate = useNavigate();
  const eventQueue = useEventQueue();

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: [queryKeys.projects],
    queryFn: fetchProjects,
  });

  const { data: storagePools = [], isLoading: storagePoolsLoading } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStoragePools(instance.project),
  });

  const { data: instances = [] } = useQuery({
    queryKey: [queryKeys.instances],
    queryFn: () => fetchInstances(instance.project),
  });

  const notifySuccess = (instanceName: string, instanceProject: string) => {
    const message = (
      <>
        Created instance <strong>{instanceName}</strong>.
      </>
    );

    const actions = [
      {
        label: "Configure",
        onClick: () =>
          navigate(
            `/ui/project/${instanceProject}/instance/${instanceName}/configuration`,
          ),
      },
    ];

    toastNotify.success(message, actions);
  };

  const getDuplicatedInstanceName = (instance: LxdInstance): string => {
    const newInstanceName = truncateInstanceName(instance.name, "-duplicate");
    return getUniqueResourceName(newInstanceName, instances);
  };

  const formik = useFormik<LxdInstanceDuplicate>({
    initialValues: {
      instanceName: getDuplicatedInstanceName(instance),
      targetProject: instance.project,
      allowInconsistent: false,
      instanceOnly: false,
      stateful: false,
      targetClusterMember: isClustered ? instance.location : "",
      targetStoragePool:
        (instance.devices["root"] as LxdDiskDevice)?.pool ??
        storagePools[0]?.name,
    },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      instanceName: instanceNameValidation(
        instance.project,
        controllerState,
      ).required(),
    }),
    onSubmit: (values) => {
      createInstance(
        JSON.stringify({
          description: instance.description,
          name: values.instanceName,
          architecture: instance.architecture,
          source: {
            allow_inconsistent: values.allowInconsistent,
            instance_only: values.instanceOnly,
            source: instance.name,
            type: "copy",
            project: instance.project,
          },
          stateful: values.stateful,
          devices: {
            ...instance.devices,
            root: {
              path: "/",
              type: "disk",
              pool: values.targetStoragePool,
            },
          },
        }),
        values.targetProject,
        values.targetClusterMember,
      )
        .then((operation) => {
          toastNotify.info(`Duplication of instance ${instance.name} started.`);
          eventQueue.set(
            operation.metadata.id,
            () => notifySuccess(values.instanceName, values.targetProject),
            (msg) =>
              toastNotify.failure(
                "Instance duplication failed.",
                new Error(msg),
                <InstanceLink instance={instance} />,
              ),
          );
        })
        .catch((e) => {
          toastNotify.failure(
            "Instance duplication failed.",
            e,
            <InstanceLink instance={instance} />,
          );
        })
        .finally(() => {
          close();
        });
    },
  });

  return (
    <Modal
      close={close}
      className="duplicate-instances-modal"
      title="Duplicate Instance"
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
            Duplicate
          </ActionButton>
        </>
      }
    >
      <Form onSubmit={formik.handleSubmit}>
        <Input
          {...formik.getFieldProps("instanceName")}
          type="text"
          label="New instance name"
          error={
            formik.touched.instanceName ? formik.errors.instanceName : null
          }
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
          options={projects.map((project) => {
            return {
              label: project.name,
              value: project.name,
            };
          })}
        />
        <Input
          {...formik.getFieldProps("allowInconsistent")}
          type="checkbox"
          label="Ignore copy errors for volatile files"
          error={
            formik.touched.allowInconsistent
              ? formik.errors.allowInconsistent
              : null
          }
        />
        <Input
          {...formik.getFieldProps("instanceOnly")}
          type="checkbox"
          label="Copy without instance snapshots"
          error={
            formik.touched.instanceOnly ? formik.errors.instanceOnly : null
          }
        />
        <Input
          {...formik.getFieldProps("stateful")}
          type="checkbox"
          label="Copy stateful"
          error={formik.touched.stateful ? formik.errors.stateful : null}
        />
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
      </Form>
    </Modal>
  );
};

export default DuplicateInstanceForm;
