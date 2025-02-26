import type { FC, ReactNode } from "react";
import { useState } from "react";
import type { LxdInstance } from "types/instance";
import {
  getInstanceSnapshotSchema,
  isInstanceStateful,
} from "util/instanceSnapshots";
import SnapshotForm from "components/forms/SnapshotForm";
import { useEventQueue } from "context/eventQueue";
import {
  Icon,
  Input,
  List,
  Tooltip,
  useNotify,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import type { SnapshotFormValues } from "util/snapshots";
import { getExpiresAt } from "util/snapshots";
import { UNDEFINED_DATE, stringToIsoTime } from "util/helpers";
import { createInstanceSnapshot } from "api/instance-snapshots";
import { queryKeys } from "util/queryKeys";
import { TOOLTIP_OVER_MODAL_ZINDEX } from "util/zIndex";
import { useToastNotification } from "context/toastNotificationProvider";
import InstanceLinkChip from "../InstanceLinkChip";
import { getInstanceSnapshotName } from "util/operations";
import InstanceSnapshotLinkChip from "../InstanceSnapshotLinkChip";

interface Props {
  close: () => void;
  instance: LxdInstance;
  onSuccess: (message: ReactNode) => void;
}

const CreateInstanceSnapshotForm: FC<Props> = ({
  close,
  instance,
  onSuccess,
}) => {
  const eventQueue = useEventQueue();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const formik = useFormik<SnapshotFormValues<{ stateful?: boolean }>>({
    initialValues: {
      name: "",
      stateful: false,
      expirationDate: null,
      expirationTime: null,
    },
    validateOnMount: true,
    validationSchema: getInstanceSnapshotSchema(instance, controllerState),
    onSubmit: (values, { resetForm }) => {
      notify.clear();
      const expiresAt =
        values.expirationDate && values.expirationTime
          ? stringToIsoTime(
              getExpiresAt(values.expirationDate, values.expirationTime),
            )
          : UNDEFINED_DATE;
      const instanceLink = <InstanceLinkChip instance={instance} />;
      createInstanceSnapshot(
        instance,
        values.name,
        expiresAt,
        values.stateful || false,
      )
        .then((operation) =>
          eventQueue.set(
            operation.metadata.id,
            () => {
              queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === queryKeys.instances,
              });
              onSuccess(
                <>
                  Snapshot{" "}
                  <InstanceSnapshotLinkChip
                    name={getInstanceSnapshotName(operation.metadata)}
                    instance={instance}
                  />{" "}
                  created for instance {instanceLink}.
                </>,
              );
              resetForm();
              close();
            },
            (msg) => {
              toastNotify.failure(
                `Snapshot creation failed for instance ${instance.name}`,
                new Error(msg),
                instanceLink,
              );
              formik.setSubmitting(false);
              close();
            },
          ),
        )
        .catch((error: Error) => {
          notify.failure("Snapshot creation failed", error, instanceLink);
          formik.setSubmitting(false);
          close();
        });
    },
  });

  let statefulInfoMessage: React.JSX.Element | string = (
    <>
      {`To create a stateful snapshot, the instance needs\n`}
      the <code>migration.stateful</code> config set to true
    </>
  );

  const isStateful = isInstanceStateful(instance);
  const isRunning = instance.status === "Running";
  if (isStateful) {
    statefulInfoMessage = `To create a stateful snapshot,\nthe instance must be running`;
  }
  if (isStateful && isRunning) {
    statefulInfoMessage = "";
  }

  const statefulCheckbox = (
    <List
      inline
      items={[
        <Input
          key="stateful"
          id="stateful"
          name="stateful"
          type="checkbox"
          label="Stateful"
          wrapperClassName="u-inline-block"
          disabled={!isStateful || !isRunning}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          defaultChecked={formik.values.stateful}
        />,
        ...(statefulInfoMessage
          ? [
              <Tooltip
                key="stateful-info"
                position="btm-left"
                message={statefulInfoMessage}
                zIndex={TOOLTIP_OVER_MODAL_ZINDEX}
              >
                <Icon name="information" />
              </Tooltip>,
            ]
          : []),
      ]}
    />
  );

  return (
    <SnapshotForm
      isEdit={false}
      formik={formik}
      close={close}
      additionalFormInput={statefulCheckbox}
    />
  );
};

export default CreateInstanceSnapshotForm;
