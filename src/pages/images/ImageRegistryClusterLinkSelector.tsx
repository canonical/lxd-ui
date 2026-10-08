import type { FC } from "react";
import { CustomSelect, useNotify } from "@canonical/react-components";
import { useClusterLinks } from "context/useClusterLinks";
import type { FormikProps } from "formik";
import type { ImageRegistryFormValues } from "types/forms/image";
import { Link } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";

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
        {link.type === "public" ? (
          <span className="cluster-link-description u-text--muted">
            Public images only
          </span>
        ) : null}
      </div>
    ),
  }));

  const clusterLinkURL = `${ROOT_PATH}/ui/cluster/links`;
  const helpText = (
    <>
      Source cluster containing the images.
      {hasNoLinks && (
        <>
          {" "}
          Create your first <Link to={clusterLinkURL}>cluster link</Link>.
        </>
      )}
    </>
  );

  return (
    <CustomSelect
      name="cluster"
      label="Source cluster"
      options={
        hasNoLinks
          ? [{ value: "", label: "No cluster links available." }]
          : [{ value: "", label: "Select a cluster" }, ...options]
      }
      value={formik.values.cluster ?? ""}
      help={helpText}
      onChange={(value) => {
        formik.setFieldValue("cluster", value);
        const selectedLink = links.find((link) => link.name === value);
        if (selectedLink?.type === "public") {
          formik.setFieldValue("sourceProject", "default");
        }
      }}
      required={required}
    />
  );
};
