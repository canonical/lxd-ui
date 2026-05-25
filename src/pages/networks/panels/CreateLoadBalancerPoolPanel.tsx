import {
  ActionButton,
  Button,
  SidePanel,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import type { FC } from "react";
import usePanelParams from "util/usePanelParams";
import { useFormik } from "formik";
import NotificationRow from "components/NotificationRow";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdNetwork } from "types/network";
import { useCurrentProject } from "context/useCurrentProject";
import { useLoadBalancerPools } from "context/useLoadBalancerPools";
import type { LoadBalancerPoolFormValues } from "types/forms/loadBalancers";
import LoadBalancerPoolForm, {
  getLoadBalancerPoolSchema,
  toLoadBalancerPool,
} from "pages/networks/forms/LoadBalancerPoolForm";
import { createLoadBalancerPool } from "api/load-balancer-pools";

interface Props {
  network: LxdNetwork;
  onCreate?: (name: string) => void;
  onCancel?: () => void;
}

const CreateLoadBalancerPoolPanel: FC<Props> = ({
  network,
  onCreate,
  onCancel,
}) => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { projectName: project } = useCurrentProject();

  const { data: existingPools = [] } = useLoadBalancerPools(
    network.name,
    project,
  );

  const closePanel = () => {
    panelParams.clear();
    notify.clear();
  };

  const handleSubmit = (values: LoadBalancerPoolFormValues) => {
    const pool = toLoadBalancerPool(values);
    createLoadBalancerPool(network.name, project, pool)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: [
            queryKeys.projects,
            project,
            queryKeys.networks,
            network.name,
            queryKeys.loadBalancerPools,
          ],
        });
        toastNotify.success(`Load balancer pool ${values.name} created.`);
        onCreate?.(pool.name);
        closePanel();
      })
      .catch((e) => {
        formik.setSubmitting(false);
        notify.failure("Load balancer pool creation failed", e);
      });
  };

  const existingPoolNames = existingPools.map((pool) => pool.name);
  const schema = getLoadBalancerPoolSchema(existingPoolNames);
  const formik = useFormik<LoadBalancerPoolFormValues>({
    initialValues: {
      name: "",
      description: "",
      targetPort: "",
      protocol: "tcp",
      instances: [],
      healthCheckType: "default",
    },
    validationSchema: schema,
    onSubmit: handleSubmit,
  });

  return (
    <SidePanel>
      <SidePanel.Header>
        <SidePanel.HeaderTitle>Create load balancer pool</SidePanel.HeaderTitle>
      </SidePanel.Header>
      <NotificationRow className="u-no-padding" />
      <LoadBalancerPoolForm formik={formik} network={network} />
      <SidePanel.Footer className="u-align--right">
        <Button
          appearance="base"
          onClick={() => {
            closePanel();
            onCancel?.();
          }}
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
          Create load balancer pool
        </ActionButton>
      </SidePanel.Footer>
    </SidePanel>
  );
};

export default CreateLoadBalancerPoolPanel;
