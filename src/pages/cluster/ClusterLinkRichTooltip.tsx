import { type FC } from "react";
import { Spinner } from "@canonical/react-components";
import { type TooltipRow } from "components/RichTooltipRow";
import { RichTooltipTable } from "components/RichTooltipTable";
import { Link } from "react-router-dom";
import ItemName from "components/ItemName";
import { useClusterLink } from "context/useClusterLinks";
import ClusterLinkStatus from "./ClusterLinkStatus";
import ResourceLabel from "components/ResourceLabel";
import ClusterLinkAddresses from "./ClusterLinkAddresses";
import { useIdentities } from "context/useIdentities";
import { getClusterLinkListUrl, getLinkIdentity } from "util/clusterLink";
import { useIsClustered } from "context/useIsClustered";

interface Props {
  clusterLink: string;
}

const ClusterLinkRichTooltip: FC<Props> = ({ clusterLink }) => {
  const { data: link, isLoading: isLinkLoading } = useClusterLink(clusterLink);
  const { data: identities = [] } = useIdentities();
  const isClustered = useIsClustered();

  if (!link && !isLinkLoading) {
    return (
      <>
        Cluster link <ResourceLabel type="cluster-link" value={clusterLink} />{" "}
        not found
      </>
    );
  }

  const identity = getLinkIdentity(identities, clusterLink);
  const authGroupCount = identity?.groups?.length ?? 0;

  const rows: TooltipRow[] = [
    {
      title: "Cluster link",
      value: link ? (
        <Link
          to={getClusterLinkListUrl(isClustered)}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ItemName item={{ name: clusterLink }} />
        </Link>
      ) : (
        <Spinner />
      ),
      valueTitle: clusterLink,
    },
    {
      title: "Status",
      value: link ? <ClusterLinkStatus link={link} /> : "-",
      className: "status-row",
    },
    {
      title: "Description",
      value: link?.description || "-",
      valueTitle: link?.description || "",
    },
    {
      title: "Type",
      value: link?.type || "-",
    },
    {
      title: "Addresses",
      value: link ? <ClusterLinkAddresses clusterLink={link} /> : "-",
    },
    {
      title: "Auth groups",
      value: authGroupCount,
    },
  ];

  return (
    <RichTooltipTable rows={rows} className="cluster-link-rich-tooltip-table" />
  );
};

export default ClusterLinkRichTooltip;
