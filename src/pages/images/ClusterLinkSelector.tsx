import type { FC } from "react";
import { CustomSelect } from "@canonical/react-components";
import { useClusterLinks } from "context/useClusterLinks";
import type { FormikProps } from "formik";
import type { ImageRegistryFormValues } from "types/forms/image";
import { useNotify } from "@canonical/react-components";
import { Link } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  formik: FormikProps<ImageRegistryFormValues>;
}

export const ClusterLinkSelector: FC<Props> = ({ formik }) => {
  const { data: links = [], error } = useClusterLinks();
  const notify = useNotify();
  const hasNoLinks = links.length === 0;

  if (error) {
    notify.failure("Loading cluster links failed", error);
  }

  const options = links.map((link) => ({
    value: link.name,
    text: link.name,
    label: (
      <div className="cluster-link-label">
        <span className="cluster-link-name">{link.name}</span>
        <span className="cluster-link-description u-text--muted">
          {link.type === "bidirectional"
            ? "public and private images"
            : "public images only"}
        </span>
      </div>
    ),
  }));

  const helpText = hasNoLinks ? (
    <>
      Cluster containing the images. Create your first{" "}
      <Link to={`${ROOT_PATH}/ui/cluster/links`}>cluster link</Link>.
    </>
  ) : (
    <>
      Cluster containing the images. Manage your{" "}
      <Link to={`${ROOT_PATH}/ui/cluster/links`}>cluster links</Link>.
    </>
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
    />
  );
};
