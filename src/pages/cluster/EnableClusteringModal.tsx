import type { FC } from "react";
import {
  ActionButton,
  Button,
  Input,
  Modal,
  Notification,
  NotificationConsumer,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { updateCluster } from "api/cluster";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNavigate } from "react-router-dom";
import { useSettings } from "context/useSettings";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateSettings } from "api/server";

interface Props {
  onClose: () => void;
}

const EnableClusteringModal: FC<Props> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const navigate = useNavigate();
  const { data: settings } = useSettings();

  const ClusteringSchema = Yup.object().shape({
    serverName: Yup.string().required("This field is required"),
    clusterAddress: Yup.string().required("This field is required"),
  });

  interface ClusteringValues {
    serverName: string;
    clusterAddress: string;
  }

  const formik = useFormik<ClusteringValues>({
    initialValues: {
      serverName: "",
      clusterAddress: settings?.config?.["cluster.https_address"] ?? "",
    },
    enableReinitialize: true,
    validationSchema: ClusteringSchema,
    onSubmit: async (values) => {
      try {
        await updateSettings({
          "cluster.https_address": String(values.clusterAddress),
        });
      } catch (e) {
        notify.failure("Failed to update cluster address", e);
        return;
      }
      const payload = JSON.stringify({
        server_name: values.serverName,
        enabled: true,
      });
      updateCluster(payload)
        .then(() => {
          toastNotify.success("Clustering enabled.");
          queryClient.invalidateQueries({
            queryKey: [queryKeys.settings],
          });
          navigate("/ui/cluster/members");
        })
        .catch((e) => {
          notify.failure("Failed to enable clustering", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
        });
    },
  });

  return (
    <Modal
      close={onClose}
      title="Enable clustering"
      className="enable-clustering-modal"
      buttonRow={
        <>
          <Button
            aria-label="Close"
            className="u-no-margin--bottom"
            onClick={onClose}
            type="button"
          >
            Close
          </Button>
          <ActionButton
            appearance="positive"
            loading={formik.isSubmitting}
            className="u-no-margin--bottom"
            onClick={() => void formik.submitForm()}
            disabled={
              !formik.values.serverName || !formik.values.clusterAddress
            }
            type="button"
          >
            Enable clustering
          </ActionButton>
        </>
      }
    >
      <NotificationConsumer />
      <Notification
        severity="caution"
        title="Are you sure you want to enable clustering?"
      >
        This action cannot be undone.
      </Notification>
      <Input
        label="Server name"
        type="text"
        required
        {...formik.getFieldProps("serverName")}
      />
      <Input
        label="Cluster address"
        type="text"
        help="Address to use for clustering traffic by this server"
        required
        {...formik.getFieldProps("clusterAddress")}
      />
    </Modal>
  );
};

export default EnableClusteringModal;
