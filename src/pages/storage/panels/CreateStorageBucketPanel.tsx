import {
  ActionButton,
  Button,
  ScrollableContainer,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import type { FC } from "react";
import { useState } from "react";
import { useEventQueue } from "context/eventQueue";
import usePanelParams from "util/usePanelParams";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import * as Yup from "yup";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import ResourceLabel from "components/ResourceLabel";
import ResourceLink from "components/ResourceLink";
import StorageBucketForm from "../forms/StorageBucketForm";
import type { StorageBucketFormValues } from "types/forms/storageBucket";
import { createStorageBucket } from "api/storage-buckets";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  getStorageBucketURL,
  testDuplicateStorageBucketName,
} from "util/storageBucket";

const CreateStorageBucketPanel: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);
  const queryClient = useQueryClient();
  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };
  const { hasStorageAndNetworkOperations } = useSupportedFeatures();
  const eventQueue = useEventQueue();

  const bucketSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        ...testDuplicateStorageBucketName(panelParams.project, controllerState),
      )
      .required("Bucket name is required"),
    pool: Yup.string().required("Pool must have a Ceph Object driver"),
  });

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.storage, panelParams.project, queryKeys.buckets],
    });
  };

  const onSuccess = (bucketName: string, pool: string) => {
    invalidateCache();
    toastNotify.success(
      <>
        Storage bucket{" "}
        <ResourceLink
          type="bucket"
          value={bucketName}
          to={getStorageBucketURL(bucketName, pool, panelParams.project)}
        />{" "}
        created.
      </>,
    );
    closePanel();
  };

  const onFailure = (bucketName: string, e: unknown) => {
    invalidateCache();
    formik.setSubmitting(false);
    notify.failure(`Creation of storage bucket ${bucketName} failed`, e);
  };

  const formik = useFormik<StorageBucketFormValues>({
    initialValues: {
      name: "",
      pool: "",
    },
    validationSchema: bucketSchema,
    onSubmit: (values) => {
      const bucketPayload = {
        name: values.name,
        config: { size: values.size },
        description: values.description,
      };

      createStorageBucket(
        JSON.stringify(bucketPayload),
        panelParams.project,
        values.pool,
        values.target,
      )
        .then((operation) => {
          if (hasStorageAndNetworkOperations) {
            toastNotify.info(
              <>
                Creation of storage bucket{" "}
                <ResourceLabel bold type="bucket" value={values.name} /> has
                started.
              </>,
            );
            eventQueue.set(
              operation.metadata.id,
              () => {
                onSuccess(values.name, values.pool);
              },
              (msg) => {
                onFailure(values.name, new Error(msg));
              },
            );
          } else {
            onSuccess(values.name, values.pool);
          }
        })
        .catch((e) => {
          onFailure(values.name, e);
        });
    },
  });

  return (
    <>
      <SidePanel>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>Create storage bucket</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[notify.notification]}
            belowIds={["panel-footer"]}
          >
            <StorageBucketForm formik={formik} />
          </ScrollableContainer>
        </SidePanel.Content>
        <SidePanel.Footer className="u-align--right">
          <Button
            appearance="base"
            onClick={closePanel}
            className="u-no-margin--bottom"
          >
            Cancel
          </Button>
          <ActionButton
            appearance="positive"
            loading={formik.isSubmitting}
            onClick={() => void formik.submitForm()}
            className="u-no-margin--bottom"
            disabled={
              !formik.isValid || formik.isSubmitting || !formik.values.name
            }
          >
            Create bucket
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};

export default CreateStorageBucketPanel;
