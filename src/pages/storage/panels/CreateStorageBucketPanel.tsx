import {
  ActionButton,
  Button,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
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

  const bucketSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        ...testDuplicateStorageBucketName(panelParams.project, controllerState),
      )
      .required("Bucket name is required"),
  });

  const handleSuccess = (bucketName: string, pool: string) => {
    toastNotify.success(
      <>
        Bucket{" "}
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
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.storage,
              panelParams.project,
              queryKeys.buckets,
            ],
          });
          handleSuccess(values.name, values.pool);
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure(`Bucket creation failed`, e);
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
