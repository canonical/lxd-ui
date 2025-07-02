import type { FC } from "react";
import { memo } from "react";
import { SearchAndFilter } from "@canonical/react-components";
import type {
  SearchAndFilterData,
  SearchAndFilterChip,
} from "@canonical/react-components/dist/components/SearchAndFilter/types";
import { useSearchParams } from "react-router-dom";
import type { LxdStorageVolume } from "types/storage";
import {
  paramsFromSearchData,
  searchParamsToChips,
} from "util/searchAndFilter";
import { useIsClustered } from "context/useIsClustered";

export interface StorageVolumesFilterType {
  queries: string[];
  pools: string[];
  volumeTypes: string[];
  contentTypes: string[];
  clusterMembers: string[];
}

interface Props {
  volumes: LxdStorageVolume[];
}

const volumeTypes: string[] = ["Container", "VM", "Image", "Custom"];

export const QUERY = "query";
export const POOL = "pool";
export const VOLUME_TYPE = "volume-type";
export const CONTENT_TYPE = "content-type";
export const CLUSTER_MEMBER = "member";

const QUERY_PARAMS = [QUERY, POOL, VOLUME_TYPE, CONTENT_TYPE, CLUSTER_MEMBER];

const contentTypes: string[] = ["Block", "Filesystem", "ISO"];

const StorageVolumesFilter: FC<Props> = ({ volumes }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isClustered = useIsClustered();

  const pools = [...new Set(volumes.map((volume) => volume.pool))];

  const locationSet = [
    ...new Set(
      volumes
        .flatMap((volume) => volume.location)
        .filter((item) => item.length > 0 && item !== "none"),
    ),
  ];

  const searchAndFilterData: SearchAndFilterData[] = [
    {
      id: 1,
      heading: "Pool",
      chips: pools.map((pool) => {
        return { lead: POOL, value: pool };
      }),
    },
    {
      id: 2,
      heading: "Volume type",
      chips: volumeTypes.map((volumeType) => {
        return { lead: VOLUME_TYPE, value: volumeType };
      }),
    },
    {
      id: 3,
      heading: "Content type",
      chips: contentTypes.map((contentType) => {
        return { lead: CONTENT_TYPE, value: contentType };
      }),
    },
    ...(isClustered
      ? [
          {
            id: 4,
            heading: "Cluster member",
            chips: ["Cluster-wide"].concat(locationSet).map((location) => {
              return { lead: CLUSTER_MEMBER, value: location };
            }),
          },
        ]
      : []),
  ];

  const onSearchDataChange = (searchData: SearchAndFilterChip[]) => {
    const newParams = paramsFromSearchData(
      searchData,
      searchParams,
      QUERY_PARAMS,
    );

    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams);
    }
  };

  return (
    <div className="search-wrapper margin-right">
      <h2 className="u-off-screen">Search and filter</h2>
      <SearchAndFilter
        existingSearchData={searchParamsToChips(searchParams, QUERY_PARAMS)}
        filterPanelData={searchAndFilterData}
        returnSearchData={onSearchDataChange}
        onExpandChange={() => {
          window.dispatchEvent(
            new CustomEvent("resize", { detail: "search-and-filter" }),
          );
        }}
        onPanelToggle={() => {
          window.dispatchEvent(new CustomEvent("sfp-toggle"));
        }}
      />
    </div>
  );
};

export default memo(StorageVolumesFilter);
