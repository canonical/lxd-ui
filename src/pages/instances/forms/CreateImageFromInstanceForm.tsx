import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { useEventQueue } from "context/eventQueue";
import { useFormik } from "formik";
import { createImage, createImageAlias } from "api/images";
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
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import InstanceLinkChip from "../InstanceLinkChip";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";

interface Props {
  instance: LxdInstance;
  close: () => void;
}

const CreateImageFromInstanceForm: FC<Props> = ({ instance, close }) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const instanceLink = <InstanceLinkChip instance={instance} />;
  const { data: project } = useProject(instance.project);
  const { canCreateImageAliases } = useProjectEntitlements();

  const notifySuccess = () => {
    const created = (
      <Link to={`/ui/project/${instance.project}/images`}>created</Link>
    );
    toastNotify.success(
      <>
        Image {created} from instance {instanceLink}.
      </>,
    );
  };

  const clearCache = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === queryKeys.images,
    });
  };

  const getInstanceToImageBody = (
    instance: LxdInstance,
    isPublic: boolean,
  ): string => {
    const body = JSON.stringify({
      public: isPublic,
      source: {
        name: instance.name,
        type: "instance",
      },
    });

    return body;
  };

  const formik = useFormik<{ alias: string; isPublic: boolean }>({
    initialValues: {
      alias: canCreateImageAliases(project)
        ? `from-instance-${instance.name}`
        : "",
      isPublic: false,
    },
    validationSchema: Yup.object().shape({
      alias: Yup.string(),
    }),
    onSubmit: (values) => {
      const alias = values.alias;

      createImage(getInstanceToImageBody(instance, values.isPublic), instance)
        .then((operation) => {
          toastNotify.info(
            <>Creation of image from instance {instanceLink} started.</>,
          );
          eventQueue.set(
            operation.metadata.id,
            (event) => {
              if (alias) {
                const fingerprint = event.metadata.metadata?.fingerprint ?? "";
                createImageAlias(fingerprint, alias, instance.project)
                  .then(clearCache)
                  .then(notifySuccess)
                  .catch((e) => {
                    toastNotify.failure(
                      `Image creation from instance "${instance.name}" succeeded. Failed to create an alias.`,
                      e,
                    );
                  });
              } else {
                clearCache();
                notifySuccess();
              }
            },
            (msg) => {
              toastNotify.failure(
                `Image creation from instance "${instance.name}" failed.`,
                new Error(msg),
                instanceLink,
              );
            },
          );
        })
        .catch((e) => {
          toastNotify.failure(
            `Image creation from instance "${instance.name}" failed.`,
            e,
            instanceLink,
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
      className="create-image-from-instance-modal"
      title="Create image from instance"
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
        <Input
          {...formik.getFieldProps("alias")}
          type="text"
          label="Alias"
          error={formik.touched.alias ? formik.errors.alias : null}
          disabled={!canCreateImageAliases(project)}
          title={
            canCreateImageAliases(project)
              ? ""
              : `You do not have permission to create image aliases in this project`
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

export default CreateImageFromInstanceForm;
