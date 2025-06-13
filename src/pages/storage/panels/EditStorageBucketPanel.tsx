import {
  ActionButton,
  Button,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import SidePanel from "components/SidePanel";
import type { FC } from "react";
import { useState } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import ScrollableContainer from "components/ScrollableContainer";
import ResourceLink from "components/ResourceLink";
import StorageBucketForm from "../forms/StorageBucketForm";
import type { StorageBucketFormValues } from "../forms/StorageBucketForm";
import { updateStorageBucket } from "api/storage-buckets";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { testDuplicateStorageBucketName } from "util/storageBucket";
import type { LxdStorageBucket } from "types/storage";
import { pluralize } from "util/instanceBulkActions";

interface Props {
  bucket: LxdStorageBucket;
}
const EditStorageBucketPanel: FC<Props> = ({ bucket }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);
  const queryClient = useQueryClient();
  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const bucketSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        ...testDuplicateStorageBucketName(
          panelParams.project,
          controllerState,
          panelParams.bucket ?? "",
        ),
      )
      .required("Bucket name is required"),
  });

  const handleSuccess = (bucketName: string) => {
    toastNotify.success(
      <>
        Bucket{" "}
        <ResourceLink
          type="bucket"
          value={bucketName}
          to={`/ui/project/${panelParams.project}/storage/buckets`}
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
    },
    enableReinitialize: true,
    validationSchema: bucketSchema,
    onSubmit: (values) => {
      const bucketPayload = {
        name: values.name,
        config: { size: values.size },
        description: values.description,
      } as LxdStorageBucket;

      updateStorageBucket(bucketPayload, values.pool, panelParams.project)
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.buckets, panelParams.project],
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
      <SidePanel isOverlay loading={false} hasError={false}>
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
            <StorageBucketForm formik={formik} isEditing />
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
              !formik.isValid ||
              formik.isSubmitting ||
              !formik.values.name ||
              changeCount === 0
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
