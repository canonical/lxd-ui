import type { FC } from "react";
import FormLink from "components/FormLink";
import type { LxdClusterLinkType } from "types/cluster";

interface Props {
  onSelect: (type: LxdClusterLinkType) => void;
}

const ClusterLinkDirectionSelection: FC<Props> = ({ onSelect }) => {
  return (
    <>
      <FormLink
        icon="devtools"
        title="Bidirectional"
        subText="Connect two LXD clusters with access in both directions. Required for replication."
        subTextBelowTitle
        onClick={() => {
          onSelect("bidirectional");
        }}
        className="u-no-margin--right"
      />
      <FormLink
        icon="chevron-right"
        title="Unidirectional"
        subText="Access another LXD cluster to fetch images, without granting access in return."
        subTextBelowTitle
        onClick={() => {
          onSelect("unidirectional");
        }}
      />
    </>
  );
};

export default ClusterLinkDirectionSelection;
