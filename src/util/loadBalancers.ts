import type { LxdLoadBalancer, LxdLoadBalancerPool } from "types/loadBalancers";
import type { FormikProps } from "formik/dist/types";
import type { LoadBalancerFormValues } from "types/forms/loadBalancers";

export const CREATE_POOL_VALUE = "/createPool";

export const setLoadBalancerCreatedPool = (
  name: string,
  formik: FormikProps<LoadBalancerFormValues>,
) => {
  const ports = formik.values.ports.map((p) => ({
    ...p,
    targetPool: p.targetPool === CREATE_POOL_VALUE ? name : p.targetPool,
  }));
  formik.setFieldValue(`ports`, ports);
};

export const getHealthCheckType = (pool: LxdLoadBalancerPool) => {
  if (pool.config.healthcheck === "false") {
    return "disabled";
  }
  if (
    Object.keys(pool.config ?? {}).some((key) => key.startsWith("healthcheck."))
  ) {
    return "custom";
  }
  return "default";
};

export const isLegacyLoadBalancer = (loadBalancer: LxdLoadBalancer) => {
  return (loadBalancer.backends ?? []).length > 0;
};
