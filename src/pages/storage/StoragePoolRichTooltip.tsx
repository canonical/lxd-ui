import { type FC } from "react";
import { Spinner } from "@canonical/react-components";
import { type TooltipRow } from "components/RichTooltipRow";
import {
  MEDIUM_TOOLTIP_BREAKPOINT,
  RichTooltipTable,
} from "components/RichTooltipTable";
import ResourceLabel from "components/ResourceLabel";
import { Link } from "react-router-dom";
import ItemName from "components/ItemName";
import { useStoragePool } from "context/useStoragePools";
import { useClusterMember } from "context/useClusterMembers";
import StoragePoolSize from "./StoragePoolSize";
import { useIsScreenBelow } from "context/useIsScreenBelow";

interface Props {
  poolName: string;
  url: string;
  location?: string;
}

const StoragePoolRichTooltip: FC<Props> = ({ poolName, url, location }) => {
  const { data: pool, isLoading: isPoolLoading } = useStoragePool(poolName);
  const { data: member, isLoading: isMemberLoading } = useClusterMember(
    location || "none",
  );

  if (!pool && !isPoolLoading) {
    return (
      <>
        Storage pool <ResourceLabel type="pool" value={poolName} bold /> not
        found
      </>
    );
  }

  const showDriverDetails = !useIsScreenBelow(
    MEDIUM_TOOLTIP_BREAKPOINT,
    "height",
  );

  const rows: TooltipRow[] = [
    {
      title: "Storage pool",
      value: pool ? (
        <Link
          to={url}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ItemName item={{ name: poolName }} />
        </Link>
      ) : (
        <Spinner />
      ),
      valueTitle: poolName,
    },
    {
      title: "Description",
      value: pool?.description || "-",
      valueTitle: pool?.description || "-",
    },
    {
      title: "Driver",
      value: pool?.driver || "-",
    },
    {
      title: "Status",
      value: pool?.status || "-",
    },
  ];

  if (showDriverDetails) {
    rows.push(
      {
        title: "Size",
        value: pool ? (
          isMemberLoading ? (
            "-"
          ) : (
            <StoragePoolSize
              pool={pool}
              member={member ?? undefined}
              hasMeterBar
              forceSingleLine
            />
          )
        ) : (
          "-"
        ),
      },
      {
        title: "Used by",
        value: pool ? pool.used_by?.length : "-",
      },
    );
  }

  return (
    <RichTooltipTable rows={rows} className="storage-pool-rich-tooltip-table" />
  );
};

export default StoragePoolRichTooltip;
