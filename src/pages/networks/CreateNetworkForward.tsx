import type { FC } from "react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ActionButton,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useFormik } from "formik";
import type { NetworkForwardFormValues } from "types/forms/networkForward";
import NetworkForwardForm, {
  NetworkForwardSchema,
  toNetworkForward,
} from "pages/networks/forms/NetworkForwardForm";
import { createNetworkForward } from "api/network-forwards";
import { Link, useNavigate, useParams } from "react-router-dom";
import BaseLayout from "components/BaseLayout";
import HelpLink from "components/HelpLink";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useEventQueue } from "context/eventQueue";
import { useNetwork } from "context/useNetworks";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { isTypeOvn } from "util/networks";
import { ROOT_PATH } from "util/rootPath";

const CreateNetworkForward: FC = () => {
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
  const { hasStorageAndNetworkOperations } = useSupportedFeatures();
  const eventQueue = useEventQueue();

  useEffect(() => {
    if (networkError) {
      notify.failure("Loading networks failed", networkError);
    }
  }, [networkError]);

  const getDefaultListenAddress = () => {
    if (!isTypeOvn(network)) {
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

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: [
        queryKeys.projects,
        project,
        queryKeys.networks,
        network,
        queryKeys.forwards,
      ],
    });
  };

  const onSuccess = (listenAddress?: string) => {
    invalidateCache();
    toastNotify.success(
      `Network forward with listen address ${listenAddress} created.`,
    );
  };

  const onFailure = (e: unknown, listenAddress?: string) => {
    invalidateCache();
    formik.setSubmitting(false);
    notify.failure(
      `Creation of network forward with listen address ${listenAddress} failed`,
      e,
    );
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
        .then((operation) => {
          navigate(
            `${ROOT_PATH}/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(networkName ?? "")}/forwards`,
          );

          if (hasStorageAndNetworkOperations && operation?.metadata.id) {
            toastNotify.info(
              <>
                Creation of network forward with listen address{" "}
                {formik.values.listenAddress} has started.
              </>,
            );
            eventQueue.set(
              operation.metadata.id,
              () => {
                onSuccess(formik.values.listenAddress);
              },
              (msg) => {
                onFailure(new Error(msg), formik.values.listenAddress);
              },
            );
          } else {
            onSuccess(formik.values.listenAddress);
          }
        })
        .catch((e) => {
          onFailure(e, formik.values.listenAddress);
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
          Create a network forward
        </HelpLink>
      }
      contentClassName="create-network"
    >
      <NetworkForwardForm formik={formik} network={network} />
      <FormFooterLayout>
        <Link
          className="p-button--base"
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project ?? "")}/network/${encodeURIComponent(networkName ?? "")}/forwards`}
        >
          Cancel
        </Link>
        <ActionButton
          loading={formik.isSubmitting}
          disabled={
            !formik.isValid ||
            formik.isSubmitting ||
            !formik.values.listenAddress
          }
          onClick={() => void formik.submitForm()}
        >
          Create
        </ActionButton>
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateNetworkForward;
