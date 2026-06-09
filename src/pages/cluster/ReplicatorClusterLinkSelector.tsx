import type { FC } from "react";
import type { FormikProps } from "formik";
import type { ReplicatorFormValues } from "types/forms/replicator";
import ClusterLinkSelector from "pages/cluster/ClusterLinkSelector";

interface Props {
  formik: FormikProps<ReplicatorFormValues>;
}

const ReplicatorClusterLinkSelector: FC<Props> = ({
  formik,
  ...selectProps
}) => {
  return (
    <ClusterLinkSelector
      {...selectProps}
      value={formik.values.cluster}
      required
      error={formik.touched.cluster ? formik.errors.cluster : undefined}
      onChange={(value) => {
        formik.setFieldError("cluster", undefined);
        void formik.setFieldTouched("cluster", true, false);
        void formik.setFieldValue("cluster", value, false).then(() => {
          void formik.validateField("cluster");
        });
      }}
      help="Cluster to replicate to. "
    />
  );
};

export default ReplicatorClusterLinkSelector;
