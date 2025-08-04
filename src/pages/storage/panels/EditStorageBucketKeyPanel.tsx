import {
  ActionButton,
  Button,
  SidePanel,
  useNotify,
  useToastNotification,
  Spinner,
} from "@canonical/react-components";
import type { FC } from "react";
import usePanelParams from "util/usePanelParams";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import ScrollableContainer from "components/ScrollableContainer";
import ResourceLink from "components/ResourceLink";
import { updateStorageBucketKey } from "api/storage-buckets";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import type { LxdStorageBucket, LxdStorageBucketKey } from "types/storage";
import { pluralize } from "util/instanceBulkActions";
import type { StorageBucketKeyFormValues } from "../forms/StorageBucketKeyForm";
import { useBucketKey } from "context/useBuckets";
import StorageBucketKeyForm from "../forms/StorageBucketKeyForm";
import { getStorageBucketURL } from "util/storageBucket";

interface Props {
  bucket: LxdStorageBucket;
}
const EditStorageBucketKeyPanel: FC<Props> = ({ bucket }) => {
  const panelParams = usePanelParams();
  const { project, key } = panelParams;
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const {
    data: bucketKey,
    error,
    isLoading,
  } = useBucketKey(bucket, key ?? "", project);

  const handleSuccess = (bucket: LxdStorageBucket) => {
    const bucketURL = getStorageBucketURL(bucket.name, bucket.pool, project);
    toastNotify.success(
      <>
        Key{" "}
        <ResourceLink
          type="bucket-key"
          value={bucketKey?.name ?? ""}
          to={bucketURL}
        />{" "}
        updated for bucket{" "}
        <ResourceLink type="bucket" value={bucket?.name ?? ""} to={bucketURL} />
        .
      </>,
    );
    closePanel();
  };

  const formik = useFormik<StorageBucketKeyFormValues>({
    initialValues: {
      name: bucketKey?.name ?? "",
      role: bucketKey?.role,
      description: bucketKey?.description,
      "access-key": bucketKey?.["access-key"] ?? "",
      "secret-key": bucketKey?.["secret-key"] ?? "",
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      const keyPayload = {
        name: values.name,
        role: values.role,
        description: values.description,
        "access-key": values["access-key"],
        "secret-key": values["secret-key"],
      } as LxdStorageBucketKey;

      updateStorageBucketKey(
        bucket.name,
        keyPayload,
        bucket.pool,
        project || "",
      )
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.storage,
              bucket.pool,
              project,
              queryKeys.buckets,
              bucket.name,
              queryKeys.keys,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.storage,
              bucket.pool,
              project,
              queryKeys.buckets,
              bucket.name,
              queryKeys.keys,
              bucketKey?.name,
            ],
          });
          handleSuccess(bucket);
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure(`Key update failed`, e);
        });
    },
  });

  if (!project) {
    return <>Missing project</>;
  }
  if (!key) {
    return <>Missing key</>;
  }

  if (error) {
    notify.failure("Loading key failed", error);
  }

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  } else if (!bucketKey) {
    return <>Loading key failed</>;
  }
  const changeCount =
    (formik.values.description !== bucketKey.description ? 1 : 0) +
    (formik.values.role !== bucketKey.role ? 1 : 0) +
    (formik.values["access-key"] !== bucketKey["access-key"] ? 1 : 0) +
    (formik.values["secret-key"] !== bucketKey["secret-key"] ? 1 : 0);

  return (
    <>
      <SidePanel>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>
            Edit key {bucketKey.name}
          </SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[notify.notification]}
            belowIds={["panel-footer"]}
          >
            <StorageBucketKeyForm formik={formik} bucket={bucket} />
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
              !formik.isValid || formik.isSubmitting || changeCount === 0
            }
          >
            {changeCount === 0
              ? "Save changes"
              : `Save ${changeCount} ${pluralize("change", changeCount)}`}
          </ActionButton>
        </SidePanel.Footer>
      </SidePanel>
    </>
  );
};

export default EditStorageBucketKeyPanel;
