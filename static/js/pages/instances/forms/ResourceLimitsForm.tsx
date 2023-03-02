import React, { FC, ReactNode } from "react";
import { CheckboxInput, Col, Input, Row } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { FormValues } from "pages/instances/CreateInstanceForm";
import MemoryLimitSelector from "pages/profiles/MemoryLimitSelector";
import CpuLimitSelector from "pages/profiles/CpuLimitSelector";
import { CpuLimit, MemoryLimit } from "types/limits";

export interface ResourceLimitsFormValues {
  limits_cpu: CpuLimit;
  limits_memory: MemoryLimit;
  limits_memory_swap: boolean;
  limits_processes?: number;
}

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
            onChange={formik.handleChange}
            checked={formik.values.limits_memory_swap}
          />
          <hr />
          <Input
            label="Max number of processes (Containers only)"
            name="limits_processes"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.limits_processes}
            type="number"
          />
          <hr />
        </Col>
      </Row>
    </>
  );
};

export default ResourceLimitsForm;
