import { type FC } from "react";
import { Link } from "react-router-dom";
import {
  CustomSelect,
  useNotify,
  type CustomSelectProps,
} from "@canonical/react-components";
import { useClusterLinks } from "context/useClusterLinks";
import ClusterLinkStatus from "pages/cluster/ClusterLinkStatus";
import { ROOT_PATH } from "util/rootPath";
import type { LxdClusterLinkType } from "types/cluster";

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
  emptyOptionLabel?: string;
  // only offer links of these types, all types when not set
  types?: LxdClusterLinkType[];
}

const ClusterLinkSelector: FC<ClusterLinkSelectorProps> = ({
  onChange,
  name = "cluster",
  label = "Cluster",
  value = "",
  error,
  required = false,
  help,
  emptyOptionLabel = "Select a cluster",
  types,
  ...selectProps
}) => {
  const { data: allLinks = [], error: apiError, isLoading } = useClusterLinks();
  const links = types
    ? allLinks.filter((link) => types.includes(link.type))
    : allLinks;
  const notify = useNotify();
  const linkNames = links.map((link) => link.name);

  const hasNoLinks = links.length === 0 && !isLoading;
  const hasMissingValue =
    Boolean(value) && !isLoading && !linkNames.includes(value);
  const emptyStateLabel = hasMissingValue
    ? "Clear value"
    : "No cluster links available";

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

  const missingValueOption = hasMissingValue
    ? [
        {
          value,
          label: `${value} (no longer available)`,
        },
      ]
    : [];

  const mergedError = hasMissingValue
    ? `Selected cluster link "${value}" no longer exists. Select another cluster link or clear the value.`
    : error;

  const selectorOptions = hasNoLinks
    ? [...missingValueOption, { value: "", label: emptyStateLabel }]
    : [
        { value: "", label: emptyOptionLabel },
        ...missingValueOption,
        ...options,
      ];

  const helpText = (
    <>
      {help}
      {hasNoLinks ? (
        <>
          Create your first{" "}
          <Link to={`${ROOT_PATH}/ui/cluster/links`}>cluster link</Link>.
        </>
      ) : (
        <>
          Manage your{" "}
          <Link to={`${ROOT_PATH}/ui/cluster/links`}>cluster links</Link>.
        </>
      )}
    </>
  );

  return (
    <CustomSelect
      {...selectProps}
      name={name}
      label={label}
      options={selectorOptions}
      value={value}
      help={helpText}
      required={required}
      error={mergedError}
      onChange={onChange}
    />
  );
};

export default ClusterLinkSelector;
