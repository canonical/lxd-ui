import type { FC } from "react";
import { useState } from "react";
import type { LxdInstance } from "types/instance";
import { useFormik } from "formik";
import {
  ActionButton,
  Button,
  Form,
  Input,
  Modal,
  Select,
  useToastNotification,
} from "@canonical/react-components";
import * as Yup from "yup";
import { createInstance } from "api/instances";
import { useNavigate } from "react-router-dom";
import { instanceNameValidation } from "util/instances";
import type { LxdDiskDevice } from "types/device";
import { useEventQueue } from "context/eventQueue";
import ClusterMemberSelector from "pages/cluster/ClusterMemberSelector";
import { getUniqueResourceName, truncateEntityName } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import ResourceLink from "components/ResourceLink";
import type { InstanceIconType } from "components/ResourceIcon";
import StoragePoolSelector from "pages/storage/StoragePoolSelector";
import { useInstances } from "context/useInstances";
import { useProjects } from "context/useProjects";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useStoragePools } from "context/useStoragePools";
import { useIsClustered } from "context/useIsClustered";
import { InstanceRichChip } from "../InstanceRichChip";

interface Props {
  instance: LxdInstance;
  close: () => void;
}

export interface LxdInstanceCopy {
  instanceName: string;
  targetProject: string;
  targetClusterMember?: string;
  targetStoragePool: string;
  allowInconsistent: boolean;
  instanceOnly: boolean;
}

const CopyInstanceForm: FC<Props> = ({ instance, close }) => {
  const toastNotify = useToastNotification();
  const isClustered = useIsClustered();
  const controllerState = useState<AbortController | null>(null);
  const navigate = useNavigate();
  const eventQueue = useEventQueue();

  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { canCreateInstances } = useProjectEntitlements();

  const { data: storagePools = [], isLoading: storagePoolsLoading } =
    useStoragePools();

  const { data: instances = [] } = useInstances(instance.project);

  const notifySuccess = (
    name: string,
    project: string,
    type: InstanceIconType,
  ) => {
    const instanceUrl = `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/instance/${encodeURIComponent(name)}`;
    const message = (
      <>
        Created instance{" "}
        <ResourceLink type={type} value={name} to={instanceUrl} />.
      </>
    );

    const actions = [
      {
        label: "Configure",
        onClick: async () => navigate(`${instanceUrl}/configuration`),
      },
    ];

    toastNotify.success(message, actions);
  };

  const getCopiedInstanceName = (instance: LxdInstance): string => {
    const newInstanceName = truncateEntityName(instance.name, "-copy");
    return getUniqueResourceName(newInstanceName, instances);
  };

  const formik = useFormik<LxdInstanceCopy>({
    initialValues: {
      instanceName: getCopiedInstanceName(instance),
      targetProject: instance.project,
      allowInconsistent: false,
      instanceOnly: false,
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
      const instanceLink = (
        <InstanceRichChip
          instanceName={instance.name}
          projectName={instance.project}
        />
      );
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
          toastNotify.info(<>Copy of instance {instanceLink} started.</>);
          eventQueue.set(
            operation.metadata.id,
            () => {
              notifySuccess(
                values.instanceName,
                values.targetProject,
                instance.type,
              );
            },
            (msg) =>
              toastNotify.failure(
                "Instance copy failed.",
                new Error(msg),
                instanceLink,
              ),
          );
        })
        .catch((e) => {
          toastNotify.failure("Instance copy failed.", e, instanceLink);
        })
        .finally(() => {
          close();
        });
    },
  });

  return (
    <Modal
      close={close}
      className="copy-instances-modal"
      title="Copy Instance"
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
            disabled={
              !formik.isValid ||
              formik.isSubmitting ||
              storagePoolsLoading ||
              projectsLoading
            }
            onClick={() => void formik.submitForm()}
          >
            Copy
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
        <StoragePoolSelector
          {...formik.getFieldProps("targetStoragePool")}
          setValue={(value) =>
            void formik.setFieldValue("targetStoragePool", value)
          }
          selectProps={{
            id: "storagePool",
            label: "Storage pool",
          }}
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
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
      </Form>
    </Modal>
  );
};

export default CopyInstanceForm;
