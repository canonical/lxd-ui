import React, { FC, ReactNode } from "react";
import { CheckboxInput, Col, Input, Row } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { FormValues } from "pages/instances/CreateInstanceForm";
import MemoryLimitSelector from "pages/profiles/MemoryLimitSelector";
import CpuLimitSelector from "pages/profiles/CpuLimitSelector";
import { CpuLimit, MemoryLimit } from "types/limits";
import classnames from "classnames";
import { boolPayload, cpuLimitToPayload } from "util/limits";

export interface ResourceLimitsFormValues {
  limits_cpu: CpuLimit;
  limits_memory: MemoryLimit;
  limits_memory_swap?: boolean;
  limits_processes?: number;
}

export const resourceLimitsPayload = (values: FormValues, isVm: boolean) => {
  return {
    ["limits.cpu"]: cpuLimitToPayload(values.limits_cpu),
    ["limits.memory"]: values.limits_memory.value
      ? `${values.limits_memory.value}${values.limits_memory.unit}`
      : undefined,
    ["limits.memory.swap"]:
      isVm || values.limits_memory_swap === undefined
        ? undefined
        : boolPayload(values.limits_memory_swap),
    ["limits.processes"]: isVm
      ? undefined
      : values.limits_processes?.toString(),
  };
};

interface Props {
  formik: FormikProps<FormValues>;
  children?: ReactNode;
}

const ResourceLimitsForm: FC<Props> = ({ formik, children }) => {
  return (
    <>
      {children}
      <Row>
        <Col size={9}>
          <CpuLimitSelector
            cpuLimit={formik.values.limits_cpu}
            setCpuLimit={(cpuLimit) => {
              formik.setFieldValue("limits_cpu", cpuLimit);
            }}
          />
          <hr />
          <MemoryLimitSelector
            memoryLimit={formik.values.limits_memory}
            setMemoryLimit={(memoryLimit) =>
              formik.setFieldValue("limits_memory", memoryLimit)
            }
          />
          <CheckboxInput
            label="Memory swap (Containers only)"
            name="limits_memory_swap"
            onBlur={formik.handleBlur}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              formik.setFieldValue("limits_memory_swap", e.target.checked)
            }
            checked={formik.values.limits_memory_swap}
            disabled={formik.values.instanceType !== "container"}
            indeterminate={formik.values.limits_memory_swap === undefined}
          />
          <hr />
          <Input
            label="Max number of processes (Containers only)"
            name="limits_processes"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.limits_processes}
            type="number"
            disabled={formik.values.instanceType !== "container"}
            labelClassName={classnames({
              "is-disabled": formik.values.instanceType !== "container",
            })}
          />
          <hr />
        </Col>
      </Row>
    </>
  );
};

export default ResourceLimitsForm;
