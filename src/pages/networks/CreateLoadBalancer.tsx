import { useEffect, type FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ActionButton,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useFormik } from "formik";
import { Link, useNavigate, useParams } from "react-router-dom";
import BaseLayout from "components/BaseLayout";
import HelpLink from "components/HelpLink";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useEventQueue } from "context/eventQueue";
import { useNetwork } from "context/useNetworks";
import { ROOT_PATH } from "util/rootPath";
import type { LoadBalancerFormValues } from "types/forms/loadBalancers";
import LoadBalancerForm, {
  LoadBalancerSchema,
  toLoadBalancer,
} from "pages/networks/forms/LoadBalancerForm";
import { createLoadBalancer } from "api/load-balancers";
import usePanelParams, { panels } from "util/usePanelParams";
import CreateLoadBalancerPoolPanel from "pages/networks/panels/CreateLoadBalancerPoolPanel";
import EditLoadBalancerPoolPanel from "pages/networks/panels/EditLoadBalancerPoolPanel";
import { setLoadBalancerCreatedPool } from "util/loadBalancers";
import { useLoadBalancerPools } from "context/useLoadBalancerPools";

const CreateLoadBalancer: FC = () => {
  const eventQueue = useEventQueue();
  const navigate = useNavigate();
  const notify = useNotify();
  const panelParams = usePanelParams();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { network: networkName, project } = useParams<{
    network: string;
    project: string;
  }>();

  if (!networkName) {
    return <>Missing Network</>;
  }

  if (!project) {
    return <>Missing project</>;
  }

  const { data: network, error: networkError } = useNetwork(
    networkName,
    project,
  );

  const { data: pools = [] } = useLoadBalancerPools(networkName, project);

  useEffect(() => {
    if (networkError) {
      notify.failure("Loading networks failed", networkError);
    }
  }, [networkError, notify]);

  const getDefaultListenAddress = () => {
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
        network?.name,
        queryKeys.loadBalancers,
      ],
    });
  };

  const onSuccess = (listenAddress?: string) => {
    invalidateCache();
    toastNotify.success(`Load balancer ${listenAddress} created.`);
  };

  const onFailure = (e: unknown, listenAddress?: string) => {
    invalidateCache();
    formik.setSubmitting(false);
    toastNotify.failure(`Creation of load balancer ${listenAddress} failed`, e);
  };

  const formik = useFormik<LoadBalancerFormValues>({
    initialValues: {
      listenAddress: getDefaultListenAddress(),
      description: "",
      ports: [
        {
          key: "initial",
          protocol: "tcp",
          listenPort: "",
          targetPool: pools[0]?.name,
        },
      ],
    },
    enableReinitialize: true,
    validationSchema: LoadBalancerSchema,
    onSubmit: (values) => {
      const loadBalancer = toLoadBalancer(values);
      createLoadBalancer(networkName, project, loadBalancer)
        .then((operation) => {
          navigate(
            `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(networkName)}/load-balancers`,
          );

          if (operation?.metadata.id) {
            toastNotify.info(
              `Creation of load balancer ${formik.values.listenAddress} has started.`,
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
          docPath="/howto/network_load_balancers/"
          title="Learn more about load balancers"
        >
          Create a load balancer
        </HelpLink>
      }
      contentClassName="create-load-balancer"
    >
      {network && <LoadBalancerForm formik={formik} network={network} />}
      <FormFooterLayout>
        <Link
          className="p-button--base"
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(networkName)}/load-balancers`}
        >
          Cancel
        </Link>
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          disabled={formik.isSubmitting}
          onClick={() => void formik.submitForm()}
        >
          Create
        </ActionButton>
      </FormFooterLayout>

      {panelParams.panel === panels.createLoadBalancerPool && network && (
        <CreateLoadBalancerPoolPanel
          network={network}
          onCreate={(name) => {
            setLoadBalancerCreatedPool(name, formik);
          }}
          onCancel={() => {
            setLoadBalancerCreatedPool("", formik);
          }}
        />
      )}

      {panelParams.panel === panels.editLoadBalancerPool && network && (
        <EditLoadBalancerPoolPanel network={network} />
      )}
    </BaseLayout>
  );
};

export default CreateLoadBalancer;
