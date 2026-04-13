import {
  ActionButton,
  Button,
  ScrollableContainer,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useState, type FC } from "react";
import { useEventQueue } from "context/eventQueue";
import usePanelParams from "util/usePanelParams";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import * as Yup from "yup";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import ResourceLink from "components/ResourceLink";
import { createStorageBucketKey } from "api/storage-buckets";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import StorageBucketKeyForm from "../forms/StorageBucketKeyForm";
import type { StorageBucketKeyFormValues } from "types/forms/storageBucketKey";
import type { LxdStorageBucket } from "types/storage";
import {
  getStorageBucketURL,
  testDuplicateBucketKeyName,
} from "util/storageBucket";
import { useCurrentProject } from "context/useCurrentProject";
import ResourceLabel from "components/ResourceLabel";

interface Props {
  bucket: LxdStorageBucket;
}

const CreateStorageBucketKeyPanel: FC<Props> = ({ bucket }) => {
  const panelParams = usePanelParams();
  const { project } = useCurrentProject();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);
  const { hasStorageAndNetworkOperations } = useSupportedFeatures();
  const eventQueue = useEventQueue();

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };
  const bucketURL = getStorageBucketURL(
    bucket.name,
    bucket.pool,
    project?.name ?? "",
  );

  const keySchema = Yup.object().shape({
    name: Yup.string()
      .test(
        ...testDuplicateBucketKeyName(
          panelParams.project,
          bucket,
          controllerState,
        ),
      )
      .required("Key name is required"),
  });

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: [
        queryKeys.storage,
        bucket.pool,
        panelParams.project,
        queryKeys.buckets,
        bucket.name,
        queryKeys.keys,
      ],
    });
  };

  const onSuccess = (keyName: string) => {
    invalidateCache();
    toastNotify.success(
      <>
        Key <ResourceLink type="bucket-key" value={keyName} to={bucketURL} />{" "}
        created for storage bucket{" "}
        <ResourceLink type="bucket" value={bucket.name} to={bucketURL} />.
      </>,
    );
    closePanel();
  };

  const onFailure = (keyName: string, e: unknown) => {
    invalidateCache();
    formik.setSubmitting(false);
    notify.failure(`Creation of key ${keyName} failed`, e);
  };

  const formik = useFormik<StorageBucketKeyFormValues>({
    initialValues: {
      name: "",
      role: "read-only",
    },
    validationSchema: keySchema,
    onSubmit: (values) => {
      const keyPayload = {
        name: values.name,
        role: values.role,
        description: values.description,
        "access-key": values["access-key"],
        "secret-key": values["secret-key"],
      };

      createStorageBucketKey(
        JSON.stringify(keyPayload),
        panelParams.project,
        bucket.pool,
        bucket.name,
      )
        .then((operation) => {
          if (hasStorageAndNetworkOperations) {
            toastNotify.info(
              <>
                Creation of key{" "}
                <ResourceLabel bold type="bucket-key" value={values.name} /> for
                storage bucket{" "}
                <ResourceLink
                  type="bucket"
                  value={bucket.name}
                  to={bucketURL}
                />
                has started.
              </>,
            );
            eventQueue.set(
              operation.metadata.id,
              () => {
                onSuccess(values.name);
              },
              (msg) => {
                onFailure(values.name, new Error(msg));
              },
            );
          } else {
            onSuccess(values.name);
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
          <SidePanel.HeaderTitle>Create key</SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[notify.notification]}
            belowIds={["panel-footer"]}
          >
            <StorageBucketKeyForm formik={formik} />
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
            Create key
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};

export default CreateStorageBucketKeyPanel;
