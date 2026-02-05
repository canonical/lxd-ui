import {
  ActionButton,
  Button,
  ScrollableContainer,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import type { FC } from "react";
import usePanelParams from "util/usePanelParams";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import ResourceLink from "components/ResourceLink";
import StorageBucketForm from "../forms/StorageBucketForm";
import type { StorageBucketFormValues } from "types/forms/storageBucket";
import { updateStorageBucket } from "api/storage-buckets";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import type { LxdStorageBucket } from "types/storage";
import { pluralize } from "util/instanceBulkActions";
import { useCurrentProject } from "context/useCurrentProject";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  bucket: LxdStorageBucket;
}
const EditStorageBucketPanel: FC<Props> = ({ bucket }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const { project } = useCurrentProject();
  const queryClient = useQueryClient();
  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const handleSuccess = (bucketName: string) => {
    toastNotify.success(
      <>
        Bucket{" "}
        <ResourceLink
          type="bucket"
          value={bucketName}
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project?.name ?? "")}/storage/buckets`}
        />{" "}
        updated.
      </>,
    );
    closePanel();
  };

  const formik = useFormik<StorageBucketFormValues>({
    initialValues: {
      name: bucket?.name,
      pool: bucket?.pool,
      size: bucket?.config.size,
      description: bucket?.description,
      target: bucket?.location,
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      const bucketPayload = {
        name: values.name,
        config: { size: values.size },
        description: values.description,
      } as LxdStorageBucket;

      updateStorageBucket(
        bucketPayload,
        values.pool,
        project?.name || "",
        values.target,
      )
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.storage,
              bucket.pool,
              project?.name ?? "",
              queryKeys.buckets,
              bucket.name,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.storage,
              project?.name ?? "",
              queryKeys.buckets,
            ],
          });
          handleSuccess(values.name);
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure(`Bucket update failed`, e);
        });
    },
  });

  const changeCount =
    (formik.values.description !== bucket.description ? 1 : 0) +
    (formik.values.size !== bucket.config.size ? 1 : 0);

  return (
    <>
      <SidePanel>
        <SidePanel.Header>
          <SidePanel.HeaderTitle>
            Edit storage bucket {bucket.name}
          </SidePanel.HeaderTitle>
        </SidePanel.Header>
        <NotificationRow className="u-no-padding" />
        <SidePanel.Content className="u-no-padding">
          <ScrollableContainer
            dependencies={[notify.notification]}
            belowIds={["panel-footer"]}
          >
            <StorageBucketForm formik={formik} bucket={bucket} />
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

export default EditStorageBucketPanel;
