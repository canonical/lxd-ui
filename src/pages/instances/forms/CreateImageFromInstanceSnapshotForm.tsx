import type { FC } from "react";
import type { LxdInstance, LxdInstanceSnapshot } from "types/instance";
import { useEventQueue } from "context/eventQueue";
import { useFormik } from "formik";
import { createImage } from "api/images";
import {
  ActionButton,
  Button,
  Form,
  Input,
  Modal,
  useToastNotification,
} from "@canonical/react-components";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import InstanceSnapshotLinkChip from "../InstanceSnapshotLinkChip";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";
import { ROOT_PATH } from "util/rootPath";
import { imageAliasPost } from "util/images";

interface Props {
  instance: LxdInstance;
  snapshot: LxdInstanceSnapshot;
  close: () => void;
}

const CreateImageFromInstanceSnapshotForm: FC<Props> = ({
  instance,
  snapshot,
  close,
}) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const snapshotLink = (
    <InstanceSnapshotLinkChip name={snapshot.name} instance={instance} />
  );
  const { data: project } = useProject(instance.project);
  const { canCreateImageAliases } = useProjectEntitlements();

  const notifySuccess = () => {
    const created = (
      <Link
        to={`${ROOT_PATH}/ui/project/${encodeURIComponent(instance.project)}/images`}
      >
        created
      </Link>
    );
    toastNotify.success(
      <>
        Image {created} from snapshot {snapshotLink}.
      </>,
    );
  };

  const clearCache = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === queryKeys.images,
    });
  };

  const formik = useFormik<{ alias: string; isPublic: boolean }>({
    initialValues: {
      alias: "",
      isPublic: false,
    },
    validationSchema: Yup.object().shape({
      alias: Yup.string(),
    }),
    onSubmit: (values) => {
      const body = JSON.stringify({
        aliases: imageAliasPost(values.alias),
        public: values.isPublic,
        source: {
          name: `${instance.name}/${snapshot.name}`,
          type: "snapshot",
        },
      });

      createImage(body, instance.project)
        .then((operation) => {
          toastNotify.info(
            <>Creation of image from snapshot {snapshotLink} started.</>,
          );
          eventQueue.set(
            operation.metadata.id,
            () => {
              clearCache();
              notifySuccess();
            },
            (msg) => {
              toastNotify.failure(
                `Image creation from snapshot "${snapshot.name}" failed.`,
                new Error(msg),
                snapshotLink,
              );
            },
          );
        })
        .catch((e) => {
          toastNotify.failure(
            `Image creation from snapshot "${snapshot.name}" failed.`,
            e,
            snapshotLink,
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
      title="Create image from instance snapshot"
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
            disabled={!formik.isValid || formik.isSubmitting}
            onClick={() => void formik.submitForm()}
          >
            Create image
          </ActionButton>
        </>
      }
    >
      <Form onSubmit={formik.handleSubmit}>
        <Input type="text" label="Instance" value={instance.name} disabled />
        <Input type="text" label="Snapshot" value={snapshot.name} disabled />
        <Input
          {...formik.getFieldProps("alias")}
          type="text"
          label="Alias"
          error={formik.touched.alias ? formik.errors.alias : null}
          disabled={!canCreateImageAliases(project)}
          title={
            canCreateImageAliases(project)
              ? ""
              : "You do not have permission to create image aliases in this project"
          }
        />
        <Input
          {...formik.getFieldProps("isPublic")}
          type="checkbox"
          label="Make the image publicly available"
          error={formik.touched.isPublic ? formik.errors.isPublic : null}
        />
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
      </Form>
    </Modal>
  );
};

export default CreateImageFromInstanceSnapshotForm;
