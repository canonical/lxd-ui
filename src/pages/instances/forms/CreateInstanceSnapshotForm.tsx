import { FC, ReactNode, useState } from "react";
import { LxdInstance } from "types/instance";
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
import { SnapshotFormValues, getExpiresAt } from "util/snapshots";
import { UNDEFINED_DATE, stringToIsoTime } from "util/helpers";
import { createInstanceSnapshot } from "api/instance-snapshots";
import { queryKeys } from "util/queryKeys";
import ItemName from "components/ItemName";
import { TOOLTIP_OVER_MODAL_ZINDEX } from "util/zIndex";
import { useToastNotification } from "context/toastNotificationProvider";

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
      void createInstanceSnapshot(
        instance,
        values.name,
        expiresAt,
        values.stateful || false,
      )
        .then((operation) =>
          eventQueue.set(
            operation.metadata.id,
            () => {
              void queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === queryKeys.instances,
              });
              onSuccess(
                <>
                  Snapshot <ItemName item={values} bold /> created for instance{" "}
                  {instance.name}.
                </>,
              );
              resetForm();
              close();
            },
            (msg) => {
              toastNotify.failure(
                `Snapshot creation failed for instance ${instance.name}`,
                new Error(msg),
              );
              formik.setSubmitting(false);
              close();
            },
          ),
        )
        .catch((error: Error) => {
          notify.failure("Snapshot creation failed", error);
          formik.setSubmitting(false);
          close();
        });
    },
  });

  let statefulInfoMessage: JSX.Element | string = (
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
                <Icon name="info--dark" />
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
