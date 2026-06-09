import { useEffect, type FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ActionButton,
  Spinner,
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
import { updateLoadBalancer } from "api/load-balancers";
import LoadBalancerForm, {
  LoadBalancerSchema,
  toLoadBalancer,
} from "pages/networks/forms/LoadBalancerForm";
import type { LoadBalancerFormValues } from "types/forms/loadBalancers";
import usePanelParams, { panels } from "util/usePanelParams";
import CreateLoadBalancerPoolPanel from "pages/networks/panels/CreateLoadBalancerPoolPanel";
import EditLoadBalancerPoolPanel from "pages/networks/panels/EditLoadBalancerPoolPanel";
import { useLoadBalancer } from "context/useLoadBalancers";
import { useCurrentProject } from "context/useCurrentProject";
import { setLoadBalancerCreatedPool } from "util/loadBalancers";

const EditLoadBalancer: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const panelParams = usePanelParams();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { projectName: project } = useCurrentProject();
  const { network: networkName, listenAddress } = useParams<{
    network: string;
    listenAddress: string;
  }>();

  if (!networkName) {
    return <>Missing Network</>;
  }

  if (!listenAddress) {
    return <>Missing listen address</>;
  }

  const {
    data: network,
    isLoading: isNetworkLoading,
    error,
  } = useNetwork(networkName ?? "", project);
  const eventQueue = useEventQueue();

  useEffect(() => {
    if (error) {
      notify.failure("Loading network failed", error);
    }
  }, [error]);

  const { data: loadBalancer, isLoading: isBalancerLoading } = useLoadBalancer(
    networkName,
    project,
    listenAddress,
  );

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: [
        queryKeys.projects,
        project,
        queryKeys.networks,
        networkName,
        queryKeys.loadBalancers,
      ],
    });
    queryClient.invalidateQueries({
      queryKey: [
        queryKeys.projects,
        project,
        queryKeys.networks,
        networkName,
        queryKeys.loadBalancers,
        listenAddress,
      ],
    });
  };

  const onSuccess = (listenAddress: string) => {
    invalidateCache();
    navigate(
      `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(networkName ?? "")}/load-balancers`,
    );
    toastNotify.success(`Load balancer ${listenAddress} updated.`);
  };

  const onFailure = (listenAddress: string, e: unknown) => {
    invalidateCache();
    formik.setSubmitting(false);
    toastNotify.failure(`Update of load balancer ${listenAddress} failed`, e);
  };

  const formik = useFormik<LoadBalancerFormValues>({
    initialValues: {
      listenAddress: listenAddress ?? "",
      description: loadBalancer?.description ?? "",
      ports:
        loadBalancer?.ports.map((port) => ({
          key: `edit-${port.listen_port}`,
          listenPort: port.listen_port,
          protocol: port.protocol,
          targetPool: port.target_pool,
        })) ?? [],
    },
    enableReinitialize: true,
    validationSchema: LoadBalancerSchema,
    onSubmit: (values) => {
      const loadBalancer = toLoadBalancer(values);

      updateLoadBalancer(networkName ?? "", project, loadBalancer)
        .then((operation) => {
          toastNotify.info(
            `Update of load balancer ${loadBalancer.listen_address} has started.`,
          );
          eventQueue.set(
            operation.metadata.id,
            () => {
              onSuccess(loadBalancer.listen_address);
            },
            (msg) => {
              onFailure(loadBalancer.listen_address, new Error(msg));
            },
          );
        })
        .catch((e) => {
          onFailure(loadBalancer.listen_address, e);
        });
    },
  });

  if (isNetworkLoading || isBalancerLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  return (
    <BaseLayout
      title={
        <HelpLink
          docPath="/howto/network_load_balancers/"
          title="Learn more about load balancers"
        >
          Edit a load balancer
        </HelpLink>
      }
      contentClassName="edit-load-balancer"
    >
      {network && <LoadBalancerForm formik={formik} isEdit network={network} />}
      <FormFooterLayout>
        <Link
          className="p-button--base"
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(networkName ?? "")}/load-balancers`}
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

export default EditLoadBalancer;
