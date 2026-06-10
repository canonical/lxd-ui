import type { FC } from "react";
import { CustomSelect, useNotify } from "@canonical/react-components";
import { useClusterLinks } from "context/useClusterLinks";
import type { FormikProps } from "formik";
import type { ImageRegistryFormValues } from "types/forms/image";
import { Link } from "react-router-dom";
import { useIsClustered } from "context/useIsClustered";
import { getClusterLinkListUrl } from "util/clusterLink";

interface Props {
  formik: FormikProps<ImageRegistryFormValues>;
  required?: boolean;
}

export const ImageRegistryClusterLinkSelector: FC<Props> = ({
  formik,
  required = false,
}) => {
  const { data: links = [], error } = useClusterLinks();
  const notify = useNotify();
  const isClustered = useIsClustered();
  const hasNoLinks = links.length === 0;

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
        <span className="cluster-link-description u-text--muted">
          {link.type === "bidirectional"
            ? "public and private images"
            : "public images only"}
        </span>
      </div>
    ),
  }));

  const helpLink = (
    <Link to={getClusterLinkListUrl(isClustered)}>cluster links</Link>
  );

  const helpText = hasNoLinks ? (
    <>Cluster containing the images. Create your first {helpLink}.</>
  ) : (
    <>Cluster containing the images. Manage your {helpLink}.</>
  );

  return (
    <CustomSelect
      {...formik.getFieldProps("cluster")}
      label="Cluster"
      options={
        hasNoLinks
          ? [{ value: "", label: "No cluster links available." }]
          : [{ value: "", label: "Select a cluster" }, ...options]
      }
      value={formik.values.cluster ?? ""}
      help={helpText}
      onChange={(value) => {
        formik.setFieldValue("cluster", value);
      }}
      required={required}
    />
  );
};
