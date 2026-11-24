import { useId, type FC } from "react";
import { RadioInput } from "@canonical/react-components";
import type { LxdClusterLinkType } from "types/cluster";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { isPublic } from "util/clusterLink";

interface Props {
  value: LxdClusterLinkType;
  disabled?: boolean;
  onSelect: (type: LxdClusterLinkType) => void;
}

export const CLUSTER_LINK_TYPES: {
  value: LxdClusterLinkType;
  label: string;
  help: string;
}[] = [
  {
    value: "bidirectional",
    label: "Bidirectional",
    help: "Connect two LXD clusters with access in both directions. Required for replication.",
  },
  {
    value: "unidirectional",
    label: "Unidirectional",
    help: "Access another LXD cluster without granting access in return. Often used to fetch images.",
  },
  {
    value: "public",
    label: "Public",
    help: "Access another LXD cluster without authentication or return access. Used for public image fetching.",
  },
];

const ClusterLinkDirectionSelection: FC<Props> = ({
  value,
  disabled,
  onSelect,
}) => {
  const name = useId();
  const { hasPublicClusterLinks } = useSupportedFeatures();

  return (
    <div role="radiogroup" aria-label="Link type">
      {CLUSTER_LINK_TYPES.filter(
        (type) => !isPublic(type.value) || hasPublicClusterLinks,
      ).map((type) => (
        <RadioInput
          key={type.value}
          name={name}
          value={type.value}
          label={type.label}
          help={type.help}
          checked={value === type.value}
          disabled={disabled}
          onChange={() => {
            onSelect(type.value);
          }}
        />
      ))}
    </div>
  );
};

export default ClusterLinkDirectionSelection;
