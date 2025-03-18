import type { FC } from "react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { ActionButton, useNotify } from "@canonical/react-components";
import { useFormik } from "formik";
import type { NetworkForwardFormValues } from "pages/networks/forms/NetworkForwardForm";
import NetworkForwardForm, {
  NetworkForwardSchema,
  toNetworkForward,
} from "pages/networks/forms/NetworkForwardForm";
import { createNetworkForward } from "api/network-forwards";
import { Link, useNavigate, useParams } from "react-router-dom";
import BaseLayout from "components/BaseLayout";
import { useDocs } from "context/useDocs";
import HelpLink from "components/HelpLink";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";
import { useNetwork } from "context/useNetworks";

const CreateNetworkForward: FC = () => {
  const docBaseLink = useDocs();
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { network: networkName, project } = useParams<{
    network: string;
    project: string;
  }>();

  const { data: network, error: networkError } = useNetwork(
    networkName ?? "",
    project ?? "",
  );

  useEffect(() => {
    if (networkError) {
      notify.failure("Loading networks failed", networkError);
    }
  }, [networkError]);

  const getDefaultListenAddress = () => {
    if (network?.type !== "ovn") {
      return "";
    }
    if (network?.config["ipv4.address"] !== "none") {
      return "0.0.0.0";
    }
    if (network?.config["ipv6.address"] !== "none") {
      return "::";
    }
    return "";
  };

  const formik = useFormik<NetworkForwardFormValues>({
    initialValues: {
      listenAddress: getDefaultListenAddress(),
      ports: [],
    },
    validationSchema: NetworkForwardSchema,
    onSubmit: (values) => {
      const forward = toNetworkForward(values);
      createNetworkForward(networkName ?? "", forward, project ?? "")
        .then((listenAddress) => {
          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              project,
              queryKeys.networks,
              network,
              queryKeys.forwards,
            ],
          });
          navigate(`/ui/project/${project}/network/${networkName}/forwards`);
          toastNotify.success(
            `Network forward with listen address ${listenAddress} created.`,
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Network forward creation failed", e);
        });
    },
  });

  return (
    <BaseLayout
      title={
        <HelpLink
          href={`${docBaseLink}/howto/network_forwards/`}
          title="Learn more about network forwards"
        >
          Create a network forward
        </HelpLink>
      }
      contentClassName="create-network"
    >
      <NetworkForwardForm formik={formik} network={network} />
      <FormFooterLayout>
        <Link
          className="p-button--base"
          to={`/ui/project/${project}/network/${networkName}/forwards`}
        >
          Cancel
        </Link>
        <ActionButton
          loading={formik.isSubmitting}
          disabled={!formik.isValid || !formik.values.listenAddress}
          onClick={() => void formik.submitForm()}
        >
          Create
        </ActionButton>
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateNetworkForward;
