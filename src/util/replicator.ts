import type { FormikProps } from "formik";
import type { ReplicatorFormValues } from "types/forms/replicator";
import type { LxdReplicator } from "types/replicator";
import { ROOT_PATH } from "./rootPath";

export const getPayload = (
  formik: FormikProps<ReplicatorFormValues>,
): Partial<LxdReplicator> => {
  return {
    name: formik.values.name,
    description: formik.values.description,
    config: {
      cluster: formik.values.cluster,
      schedule: formik.values.schedule,
    },
  };
};

export const getReplicatorListUrl = (isClustered = false): string => {
  return isClustered
    ? `${ROOT_PATH}/ui/cluster/replicators`
    : `${ROOT_PATH}/ui/server/replicators`;
};
