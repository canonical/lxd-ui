import type { FC } from "react";
import { CustomSelect, useNotify } from "@canonical/react-components";
import { useClusterLinks } from "context/useClusterLinks";
import type { FormikProps } from "formik";
import { Link } from "react-router-dom";
import type { ReplicatorFormValues } from "types/forms/replicator";
import ClusterLinkStatus from "pages/cluster/ClusterLinkStatus";
import { useIsClustered } from "context/useIsClustered";
import { getClusterLinkListUrl } from "util/clusterLink";

interface Props {
  formik: FormikProps<ReplicatorFormValues>;
}

export const ReplicatorClusterLinkSelector: FC<Props> = ({
  formik,
  ...selectProps
}) => {
  const { data: links = [], error, isLoading } = useClusterLinks();
  const notify = useNotify();
  const isClustered = useIsClustered();
  const hasNoLinks = links.length === 0 && !isLoading;

  if (error) {
    notify.failure("Loading cluster links failed", error);
  }

  const options = links.map((link) => ({
    value: link.name,
    text: link.name,
    label: (
      <div className="cluster-link-label">
        <span className="cluster-link-name u-truncate" title={link.name}>
          {link.name}
        </span>
        <span className="u-text--muted">
          <ClusterLinkStatus link={link} />
        </span>
      </div>
    ),
  }));

  const helpLink = (
    <Link to={getClusterLinkListUrl(isClustered)}>cluster links</Link>
  );

  const helpText = hasNoLinks ? (
    <>Cluster to replicate to. Create your first {helpLink}.</>
  ) : (
    <>Cluster to replicate to. Manage your {helpLink}.</>
  );
  return (
    <CustomSelect
      {...selectProps}
      name="cluster"
      label="Cluster"
      options={
        hasNoLinks
          ? [{ value: "", label: "No cluster links available." }]
          : [{ value: "", label: "Select a cluster" }, ...options]
      }
      value={formik.values.cluster ?? ""}
      help={helpText}
      onChange={(value) => {
        formik.setFieldError("cluster", undefined);
        void formik.setFieldTouched("cluster", true, false);
        void formik.setFieldValue("cluster", value, false).then(() => {
          void formik.validateField("cluster");
        });
      }}
      required
      error={formik.touched.cluster ? formik.errors.cluster : undefined}
    />
  );
};
