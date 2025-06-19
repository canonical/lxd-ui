import {
  ActionButton,
  Button,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import SidePanel from "components/SidePanel";
import type { FC } from "react";
import usePanelParams from "util/usePanelParams";
import * as Yup from "yup";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import ScrollableContainer from "components/ScrollableContainer";
import ResourceLink from "components/ResourceLink";
import { createStorageBucketKey } from "api/storage-buckets";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import StorageBucketKeyForm from "../forms/StorageBucketKeyForm";
import type { StorageBucketKeyFormValues } from "../forms/StorageBucketKeyForm";
import type { LxdStorageBucket } from "types/storage";

interface Props {
  bucket: LxdStorageBucket;
}

const CreateStorageBucketKeyPanel: FC<Props> = ({ bucket }) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const keySchema = Yup.object().shape({
    name: Yup.string().required("Key name is required"),
  });

  const handleSuccess = (keyName: string) => {
    toastNotify.success(
      <>
        Key{" "}
        <ResourceLink
          type="bucket" //Change to what?
          value={keyName}
          to={``} //Open edit panel for the identity.
        />{" "}
        created.
      </>,
    );
    closePanel();
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
      };

      createStorageBucketKey(
        JSON.stringify(keyPayload),
        panelParams.project,
        bucket.pool,
        bucket.name,
      )
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.buckets,
              panelParams.project,
              queryKeys.bucketKeys,
            ],
          });
          handleSuccess(values.name);
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure(`Key creation failed`, e);
        });
    },
  });

  return (
    <>
      <SidePanel isOverlay loading={false} hasError={false}>
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
