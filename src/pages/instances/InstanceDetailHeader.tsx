import type { FC } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LxdInstance } from "types/instance";
import type { RenameHeaderValues } from "components/RenameHeader";
import RenameHeader from "components/RenameHeader";
import { renameInstance } from "api/instances";
import InstanceStateActions from "pages/instances/actions/InstanceStateActions";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEventQueue } from "context/eventQueue";
import {
  instanceLinkFromOperation,
  instanceNameValidation,
} from "util/instances";
import { getInstanceName } from "util/operations";
import InstanceDetailActions from "./InstanceDetailActions";
import { useInstanceEntitlements } from "util/entitlements/instances";
import { useCurrentProject } from "context/useCurrentProject";
import { useToastNotification } from "@canonical/react-components";
import { useInstanceLoading } from "context/instanceLoading";
import { InstanceRichChip } from "./InstanceRichChip";

interface Props {
  name: string;
  instance?: LxdInstance;
  project: string;
  isLoading: boolean;
}

const InstanceDetailHeader: FC<Props> = ({
  name,
  instance,
  project,
  isLoading,
}) => {
  const eventQueue = useEventQueue();
  const navigate = useNavigate();
  const toastNotify = useToastNotification();
  const { canEditInstance } = useInstanceEntitlements();
  const controllerState = useState<AbortController | null>(null);
  const { canViewProject } = useCurrentProject();
  const instanceLoading = useInstanceLoading();

  const loadingType = instance ? instanceLoading.getType(instance) : undefined;

  const RenameSchema = Yup.object().shape({
    name: instanceNameValidation(project, controllerState, name).required(
      "Instance name is required",
    ),
  });

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (name === values.name) {
        formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      renameInstance(name, values.name, project)
        .then((operation) => {
          const instanceLink = (
            <InstanceRichChip
              instanceName={values.name}
              projectName={project}
            />
          );
          eventQueue.set(
            operation.metadata.id,
            () => {
              navigate(
                `/ui/project/${encodeURIComponent(project)}/instance/${encodeURIComponent(values.name)}`,
              );
              toastNotify.success(
                <>
                  Instance{" "}
                  <strong>{getInstanceName(operation.metadata)}</strong> renamed
                  to {instanceLink}.
                </>,
              );
              formik.setFieldValue("isRenaming", false);
            },
            (msg) =>
              toastNotify.failure(
                "Renaming instance failed.",
                new Error(msg),
                instanceLinkFromOperation({
                  operation,
                  project,
                }),
              ),
            () => {
              formik.setSubmitting(false);
            },
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          toastNotify.failure(
            `Renaming instance failed.`,
            e,
            instance && (
              <InstanceRichChip
                instanceName={instance.name}
                projectName={instance.project}
              />
            ),
          );
        });
    },
  });

  const getDisabledReason = () => {
    if (!canEditInstance(instance)) {
      return "You do not have permission to rename this instance";
    }

    if (!instance) {
      return "Invalid Instance: Cannot be renamed";
    }

    if (instance.status !== "Stopped") {
      return "Stop the instance to rename";
    }

    return undefined;
  };

  return (
    !isLoading && (
      <RenameHeader
        name={name}
        titleClassName="instance-detail-title"
        parentItems={[
          <Link
            to={
              canViewProject
                ? `/ui/project/${encodeURIComponent(project)}/instances`
                : "/ui/all-projects/instances"
            }
            key={1}
          >
            Instances
          </Link>,
        ]}
        renameDisabledReason={getDisabledReason()}
        centerControls={
          instance ? (
            <div className="instance-header-state-controls">
              <i className="status u-text--muted">
                {loadingType ?? instance.status}
              </i>
              <InstanceStateActions key="state" instance={instance} />
            </div>
          ) : null
        }
        controls={
          instance ? (
            <InstanceDetailActions
              instance={instance}
              project={project}
              isLoading={isLoading}
            />
          ) : null
        }
        isLoaded={Boolean(instance)}
        formik={formik}
      />
    )
  );
};

export default InstanceDetailHeader;
