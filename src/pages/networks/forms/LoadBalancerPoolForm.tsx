import { useEffect, type FC } from "react";
import {
  Form,
  Input,
  OutputField,
  ScrollableContainer,
  Select,
  useListener,
  useNotify,
} from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import * as Yup from "yup";
import type { LxdNetwork } from "types/network";
import { updateMaxHeight } from "util/updateMaxHeight";
import type { LoadBalancerPoolFormValues } from "types/forms/loadBalancers";
import LoadBalancerInstanceSelector from "pages/networks/forms/LoadBalancerInstanceSelector";
import type { LxdLoadBalancerPool } from "types/loadBalancers";

export const toLoadBalancerPool = (
  values: LoadBalancerPoolFormValues,
): LxdLoadBalancerPool => {
  const pool: LxdLoadBalancerPool = {
    name: values.name,
    description: values.description,
    config: {
      protocol: values.protocol,
      target_port: values.targetPort.toString(),
    },
    instances: values.instances.map((instance) => ({
      name: instance.name,
      target_port: instance.targetPort,
    })),
  };

  if (values.healthCheckType === "disabled") {
    pool.config.healthcheck = "false";
  }

  if (values.healthCheckType === "custom") {
    pool.config["healthcheck.interval"] =
      values.healthCheckInterval?.toString() ?? "";
    pool.config["healthcheck.timeout"] =
      values.healthCheckTimeout?.toString() ?? "";
    pool.config["healthcheck.success_count"] =
      values.healthCheckSuccessCount?.toString() ?? "";
    pool.config["healthcheck.failure_count"] =
      values.healthCheckFailureCount?.toString() ?? "";
  }

  return pool;
};

export const getLoadBalancerPoolSchema = (existingNames: string[]) =>
  Yup.object().shape({
    name: Yup.string()
      .required("Name is required")
      .test(
        "unique-name",
        "A load balancer pool with this name already exists",
        function (value) {
          if (!value) {
            return true;
          }
          return !existingNames.includes(value);
        },
      ),
    targetPort: Yup.number().required("Target port is required"),
  });

interface Props {
  formik: FormikProps<LoadBalancerPoolFormValues>;
  isEdit?: boolean;
  network?: LxdNetwork;
}

const LoadBalancerPoolForm: FC<Props> = ({ formik, isEdit, network }) => {
  const notify = useNotify();

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message]);
  useListener(window, updateFormHeight, "resize", true);

  return (
    <Form className="form" onSubmit={formik.handleSubmit}>
      <ScrollableContainer
        dependencies={[notify.notification]}
        belowIds={["panel-footer"]}
      >
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
        {isEdit ? (
          <OutputField id="name" label="Name" value={formik.values.name} />
        ) : (
          <Input
            {...formik.getFieldProps("name")}
            id="name"
            label="Name"
            type="text"
            placeholder="Enter name"
            autoFocus
            required
            error={formik.touched.name ? formik.errors.name : undefined}
          />
        )}
        <Input
          {...formik.getFieldProps("description")}
          id="description"
          label="Description"
          type="text"
          placeholder="Enter description"
          error={
            formik.touched.description ? formik.errors.description : undefined
          }
        />
        <Select
          {...formik.getFieldProps("protocol")}
          id="protocol"
          label="Protocol"
          options={[
            { label: "TCP", value: "tcp" },
            { label: "UDP", value: "udp" },
          ]}
          onChange={(e) => {
            formik.setFieldValue("protocol", e.target.value);
          }}
        />
        <Input
          {...formik.getFieldProps("targetPort")}
          id="targetPort"
          type="number"
          label="Target port"
          placeholder="Enter target port"
          help="Destination port for forwarded traffic"
          required
          error={
            formik.touched.targetPort ? formik.errors.targetPort : undefined
          }
        />
        <LoadBalancerInstanceSelector
          selectedItems={formik.values.instances}
          setValue={(value) => {
            formik.setFieldValue("instances", value);
          }}
          network={network}
        />
        <Select
          {...formik.getFieldProps("healthCheckType")}
          id="healthCheckType"
          label="Health check"
          options={[
            { value: "custom", label: "Custom" },
            { value: "default", label: "Default" },
            { value: "disabled", label: "Disabled" },
          ]}
          help="Default uses LXD's default health check settings. Custom allows you to specify the health check settings. Disabled turns off health checks."
        />
        {formik.values.healthCheckType === "custom" && (
          <>
            <Input
              {...formik.getFieldProps("healthCheckInterval")}
              id="healthCheckInterval"
              type="number"
              label="Health check interval"
              placeholder="Enter health check interval"
              help="Seconds between health checks"
            />
            <Input
              {...formik.getFieldProps("healthCheckTimeout")}
              id="healthCheckTimeout"
              type="number"
              label="Health check timeout"
              placeholder="Enter health check timeout"
              help="Seconds until a health check is considered failing"
            />
            <Input
              {...formik.getFieldProps("healthCheckSuccessCount")}
              id="healthCheckSuccessCount"
              type="number"
              label="Health check success count"
              placeholder="Enter health check success count"
            />
            <Input
              {...formik.getFieldProps("healthCheckFailureCount")}
              id="healthCheckFailureCount"
              type="number"
              label="Health check failure count"
              placeholder="Enter health check failure count"
            />
          </>
        )}
      </ScrollableContainer>
    </Form>
  );
};

export default LoadBalancerPoolForm;
