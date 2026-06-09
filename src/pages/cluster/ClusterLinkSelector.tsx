import type { FC } from "react";
import { Link } from "react-router-dom";
import {
  CustomSelect,
  useNotify,
  type CustomSelectProps,
} from "@canonical/react-components";
import { useClusterLinks } from "context/useClusterLinks";
import { useIsClustered } from "context/useIsClustered";
import ClusterLinkStatus from "pages/cluster/ClusterLinkStatus";
import { getClusterLinkListUrl } from "util/clusterLink";

interface ClusterLinkSelectorProps extends Omit<
  CustomSelectProps,
  "options" | "onChange" | "value"
> {
  onChange: (value: string) => void;
  name?: string;
  label?: string;
  value?: string;
  error?: string;
  required?: boolean;
  help?: React.ReactNode;
}

const ClusterLinkSelector: FC<ClusterLinkSelectorProps> = ({
  onChange,
  name = "cluster",
  label = "Cluster",
  value = "",
  error,
  required = false,
  help,
  ...selectProps
}) => {
  const { data: links = [], error: apiError, isLoading } = useClusterLinks();
  const notify = useNotify();
  const isClustered = useIsClustered();

  const hasNoLinks = links.length === 0 && !isLoading;

  if (apiError) {
    notify.failure("Loading cluster links failed", apiError);
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

  const helpText = (
    <>
      {help}
      Manage your{" "}
      <Link to={getClusterLinkListUrl(isClustered)}>cluster links</Link>.
    </>
  );

  return (
    <CustomSelect
      {...selectProps}
      name={name}
      label={label}
      options={
        hasNoLinks
          ? [{ value: "", label: "No cluster links available" }]
          : [{ value: "", label: "None" }, ...options]
      }
      value={value}
      help={helpText}
      required={required}
      error={error}
      onChange={onChange}
    />
  );
};

export default ClusterLinkSelector;
