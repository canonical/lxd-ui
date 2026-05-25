import {
  ActionButton,
  Button,
  SidePanel,
  useNotify,
} from "@canonical/react-components";
import type { FC } from "react";
import usePanelParams from "util/usePanelParams";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdNetwork } from "types/network";
import { updateLoadBalancerPool } from "api/load-balancer-pools";
import { useCurrentProject } from "context/useCurrentProject";
import {
  useLoadBalancerPool,
  useLoadBalancerPools,
} from "context/useLoadBalancerPools";
import type { LoadBalancerPoolFormValues } from "types/forms/loadBalancers";
import LoadBalancerPoolForm, {
  getLoadBalancerPoolSchema,
  toLoadBalancerPool,
} from "pages/networks/forms/LoadBalancerPoolForm";
import { useEventQueue } from "context/eventQueue";
import { getHealthCheckType } from "util/loadBalancers";

interface Props {
  network: LxdNetwork;
}

const EditLoadBalancerPoolPanel: FC<Props> = ({ network }) => {
  const eventQueue = useEventQueue();
  const panelParams = usePanelParams();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { projectName: project } = useCurrentProject();

  const { data: pool } = useLoadBalancerPool(
    network.name,
    project,
    panelParams.pool ?? "",
  );

  const { data: existingPools = [] } = useLoadBalancerPools(
    network.name,
    project,
  );

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: [
        queryKeys.projects,
        project,
        queryKeys.networks,
        network.name,
        queryKeys.loadBalancerPools,
      ],
    });
  };

  const handleFailure = (e: unknown) => {
    invalidateCache();
    formik.setSubmitting(false);
    notify.failure("Load balancer pool update failed", e);
  };

  const handleSuccess = () => {
    invalidateCache();
    closePanel();
  };

  const handleSubmit = (values: LoadBalancerPoolFormValues) => {
    const poolToSave = toLoadBalancerPool(values);
    updateLoadBalancerPool(network.name, project, poolToSave)
      .then((operation) => {
        eventQueue.set(
          operation.metadata.id,
          () => {
            handleSuccess();
          },
          (msg) => {
            handleFailure(new Error(msg));
          },
        );
      })
      .catch(handleFailure);
  };

  const existingPoolNames = existingPools
    .map((pool) => pool.name)
    .filter((candidate) => candidate !== pool?.name);
  const schema = getLoadBalancerPoolSchema(existingPoolNames);

  const formik = useFormik<LoadBalancerPoolFormValues>({
    initialValues: {
      name: pool?.name ?? "",
      description: pool?.description ?? "",
      targetPort: pool?.config["target_port"] ?? "",
      protocol: pool?.config["protocol"] ?? "tcp",
      instances: pool?.instances ?? [],
      healthCheckType: pool ? getHealthCheckType(pool) : "default",
      healthCheckInterval: pool?.config["healthcheck.interval"] ?? "5",
      healthCheckTimeout: pool?.config["healthcheck.timeout"] ?? "5",
      healthCheckSuccessCount: pool?.config["healthcheck.success_count"] ?? "1",
      healthCheckFailureCount: pool?.config["healthcheck.failure_count"] ?? "1",
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: handleSubmit,
  });

  return (
    <SidePanel>
      <SidePanel.Header>
        <SidePanel.HeaderTitle>Edit load balancer pool</SidePanel.HeaderTitle>
      </SidePanel.Header>
      <NotificationRow className="u-no-padding" />
      <LoadBalancerPoolForm formik={formik} network={network} isEdit />
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
          onClick={() => void formik.submitForm()}
          className="u-no-margin--bottom"
          disabled={
            !formik.isValid || formik.isSubmitting || !formik.values.name
          }
          loading={formik.isSubmitting}
        >
          Update load balancer pool
        </ActionButton>
      </SidePanel.Footer>
    </SidePanel>
  );
};

export default EditLoadBalancerPoolPanel;
