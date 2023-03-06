import React, { FC, ReactNode } from "react";
import { Col, Input, Row, Select } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { FormValues } from "pages/instances/CreateInstanceForm";
import MemoryLimitSelector from "pages/profiles/MemoryLimitSelector";
import CpuLimitSelector from "pages/profiles/CpuLimitSelector";
import { CpuLimit, MemoryLimit } from "types/limits";
import classnames from "classnames";
import { cpuLimitToPayload } from "util/limits";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";
import { booleanFields } from "util/instanceOptions";

export interface ResourceLimitsFormValues {
  limits_cpu: CpuLimit;
  limits_memory: MemoryLimit;
  limits_memory_swap?: string;
  limits_disk_priority?: number;
  limits_processes?: number;
}

export const resourceLimitsPayload = (
  values: FormValues | EditInstanceFormValues,
  isVm: boolean
) => {
  return {
    ["limits.cpu"]: cpuLimitToPayload(values.limits_cpu),
    ["limits.memory"]: values.limits_memory.value
      ? `${values.limits_memory.value}${values.limits_memory.unit}`
      : undefined,
    ["limits.memory.swap"]:
      isVm || values.limits_memory_swap === undefined
        ? undefined
        : values.limits_memory_swap,
    ["limits.disk.priority"]: values.limits_disk_priority?.toString(),
    ["limits.processes"]: isVm
      ? undefined
      : values.limits_processes?.toString(),
  };
};

interface Props {
  formik: FormikProps<FormValues> | FormikProps<EditInstanceFormValues>;
  children?: ReactNode;
}

const ResourceLimitsForm: FC<Props> = ({ formik, children }) => {
  return (
    <>
      {children}
      <Row>
        <Col size={8}>
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
          <Select
            label="Memory swap (Containers only)"
            name="limits_memory_swap"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            options={booleanFields}
            value={formik.values.limits_memory_swap}
            disabled={formik.values.instanceType !== "container"}
          />
          <hr />
          <Input
            label="Disk priority"
            name="limits_disk_priority"
            placeholder="Enter number"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.limits_disk_priority}
            type="number"
            help="Controls how much priority to give to the instance’s I/O requests when under load (integer between 0 and 10)"
          />
          <hr />
          <Input
            label="Max number of processes (Containers only)"
            name="limits_processes"
            placeholder="Enter number"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.limits_processes}
            type="number"
            disabled={formik.values.instanceType !== "container"}
            labelClassName={classnames({
              "is-disabled": formik.values.instanceType !== "container",
            })}
          />
        </Col>
      </Row>
    </>
  );
};

export default ResourceLimitsForm;
