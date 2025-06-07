import type { FC, KeyboardEvent } from "react";
import {
  ActionButton,
  Button,
  Form,
  Input,
  Modal,
  Select,
  useToastNotification,
} from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { useIsClustered } from "context/useIsClustered";
import ClusterMemberSelector from "pages/cluster/ClusterMemberSelector";
import StoragePoolSelector from "pages/storage/StoragePoolSelector";
import { useFormik } from "formik";
import type { LxdDiskDevice } from "types/device";
import InstanceLinkChip from "pages/instances/InstanceLinkChip";
import { migrateInstance } from "api/instances";
import { queryKeys } from "util/queryKeys";
import { useInstanceLoading } from "context/instanceLoading";
import { useEventQueue } from "context/eventQueue";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useStoragePools } from "context/useStoragePools";
import { useProjects } from "context/useProjects";
import { useProjectEntitlements } from "util/entitlements/projects";

export interface MigrateInstanceFormValues {
  project: string;
  location?: string;
  storagePool: string;
}

interface Props {
  close: () => void;
  instance: LxdInstance;
}

const MigrateInstanceModal: FC<Props> = ({ close, instance }) => {
  const isClustered = useIsClustered();
  const toastNotify = useToastNotification();
  const instanceLoading = useInstanceLoading();
  const eventQueue = useEventQueue();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: storagePools = [], isLoading: storagePoolsLoading } =
    useStoragePools();
  const { canCreateInstances } = useProjectEntitlements();

  const handleSuccess = (values: MigrateInstanceFormValues) => {
    const oldUrl = window.location.pathname;
    const newUrl = oldUrl.replace(
      `/project/${instance.project}/instance/${instance.name}`,
      `/project/${values.project}/instance/${instance.name}`,
    );
    // we are still on the instance detail page and the project has changed
    if (oldUrl !== newUrl) {
      navigate(newUrl);
    }

    const newInstance = {
      ...instance,
      project: values.project,
    };
    toastNotify.success(
      <>
        Instance <InstanceLinkChip instance={newInstance} /> successfully
        migrated.
      </>,
    );
  };

  const handleFailure = (e: Error) => {
    toastNotify.failure(
      `Migration failed for instance ${instance.name}`,
      e,
      <InstanceLinkChip instance={instance} />,
    );
  };

  const clearCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.instances, instance.name],
    });
    instanceLoading.setFinish(instance);
  };

  const formik = useFormik<MigrateInstanceFormValues>({
    initialValues: {
      project: instance.project,
      location: isClustered ? instance.location : "",
      storagePool:
        (instance.devices["root"] as LxdDiskDevice)?.pool ??
        storagePools[0]?.name,
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      instanceLoading.setLoading(instance, "Migrating");
      const targetPool =
        formik.values.storagePool !== formik.initialValues.storagePool
          ? formik.values.storagePool
          : undefined;
      const targetProject =
        formik.values.project !== formik.initialValues.project
          ? formik.values.project
          : undefined;
      migrateInstance(
        instance.name,
        instance.project,
        values.location,
        targetPool,
        targetProject,
      )
        .then((operation) => {
          toastNotify.info(
            <>
              Migration started for <InstanceLinkChip instance={instance} />.
            </>,
          );
          queryClient.invalidateQueries({
            queryKey: [queryKeys.instances, instance.name, instance.project],
          });
          eventQueue.set(
            operation.metadata.id,
            () => {
              handleSuccess(values);
            },
            (msg) => {
              handleFailure(new Error(msg));
            },
            clearCache,
          );
        })
        .catch((e: Error) => {
          handleFailure(e);
        })
        .finally(() => {
          close();
          clearCache();
        });
    },
  });

  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

  const hasNothingChanged =
    formik.values.project === formik.initialValues.project &&
    formik.values.location === formik.initialValues.location &&
    formik.values.storagePool === formik.initialValues.storagePool;

  return (
    <Modal
      close={close}
      className="migrate-instance-modal"
      title="Migrate instance"
      onKeyDown={handleEscKey}
      aria-labelledby="migrate-title"
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
              storagePoolsLoading ||
              projectsLoading ||
              hasNothingChanged
            }
            onClick={() => void formik.submitForm()}
          >
            Migrate instance
          </ActionButton>
        </>
      }
    >
      <Form onSubmit={formik.handleSubmit}>
        <ClusterMemberSelector
          {...formik.getFieldProps("location")}
          id="location"
          label="Cluster member"
        />
        <StoragePoolSelector
          {...formik.getFieldProps("storagePool")}
          setValue={(value) => void formik.setFieldValue("storagePool", value)}
          selectProps={{
            id: "storagePool",
            label: "Storage pool",
          }}
        />
        <Select
          {...formik.getFieldProps("project")}
          id="project"
          label="Project"
          options={projects.filter(canCreateInstances).map((project) => {
            return {
              label: project.name,
              value: project.name,
            };
          })}
        />
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
      </Form>
    </Modal>
  );
};

export default MigrateInstanceModal;
