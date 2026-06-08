import type { FormikProps } from "formik";
import type { ReplicatorFormValues } from "types/forms/replicator";
import type { LxdReplicator } from "types/replicator";

export const getPayload = (
  formik: FormikProps<ReplicatorFormValues>,
): Partial<LxdReplicator> => {
  return {
    name: formik.values.name,
    description: formik.values.description,
    config: {
      cluster: formik.values.cluster,
      schedule: formik.values.schedule,
      snapshot: formik.values.snapshot,
    },
  };
};
