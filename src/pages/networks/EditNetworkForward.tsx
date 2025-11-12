import type { FC } from "react";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ActionButton,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useFormik } from "formik";
import type { NetworkForwardFormValues } from "pages/networks/forms/NetworkForwardForm";
import NetworkForwardForm, {
  NetworkForwardSchema,
  toNetworkForward,
} from "pages/networks/forms/NetworkForwardForm";
import {
  fetchNetworkForward,
  updateNetworkForward,
} from "api/network-forwards";
import { Link, useNavigate, useParams } from "react-router-dom";
import BaseLayout from "components/BaseLayout";
import HelpLink from "components/HelpLink";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useNetwork } from "context/useNetworks";

const EditNetworkForward: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const {
    network: networkName,
    project,
    forwardAddress,
    memberName,
  } = useParams<{
    network: string;
    project: string;
    forwardAddress: string;
    memberName?: string;
  }>();

  const { data: network, error } = useNetwork(networkName ?? "", project ?? "");

  useEffect(() => {
    if (error) {
      notify.failure("Loading network failed", error);
    }
  }, [error]);

  const { data: forward } = useQuery({
    queryKey: [
      queryKeys.projects,
      project,
      queryKeys.networks,
      networkName,
      queryKeys.forwards,
      forwardAddress,
      queryKeys.members,
      memberName,
    ],
    queryFn: async () =>
      fetchNetworkForward(
        networkName ?? "",
        forwardAddress ?? "",
        project ?? "",
        memberName ?? "",
      ),
  });

  const formik = useFormik<NetworkForwardFormValues>({
    initialValues: {
      listenAddress: forwardAddress ?? "",
      defaultTargetAddress: forward?.config.target_address ?? "",
      description: forward?.description ?? "",
      ports:
        forward?.ports.map((port) => ({
          listenPort: port.listen_port,
          protocol: port.protocol,
          targetAddress: port.target_address,
          targetPort: port.target_port,
        })) ?? [],
      location: forward?.location,
    },
    enableReinitialize: true,
    validationSchema: NetworkForwardSchema,
    onSubmit: (values) => {
      const forward = toNetworkForward(values);

      updateNetworkForward(networkName ?? "", forward, project ?? "")
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              project,
              queryKeys.networks,
              networkName,
              queryKeys.forwards,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              project,
              queryKeys.networks,
              networkName,
              queryKeys.forwards,
              forwardAddress,
              queryKeys.members,
              memberName,
            ],
          });
          navigate(
            `/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(networkName ?? "")}/forwards`,
          );
          toastNotify.success(
            `Network forward ${forward.listen_address} updated.`,
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Network forward update failed", e);
        });
    },
  });

  return (
    <BaseLayout
      title={
        <HelpLink
          docPath="/howto/network_forwards/"
          title="Learn more about network forwards"
        >
          Edit a network forward
        </HelpLink>
      }
      contentClassName="edit-network"
    >
      <NetworkForwardForm formik={formik} isEdit network={network} />
      <FormFooterLayout>
        <Link
          className="p-button--base"
          to={`/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(networkName ?? "")}/forwards`}
        >
          Cancel
        </Link>
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          disabled={
            !formik.isValid ||
            formik.isSubmitting ||
            !formik.values.listenAddress
          }
          onClick={() => void formik.submitForm()}
        >
          Update
        </ActionButton>
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default EditNetworkForward;
