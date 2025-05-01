import type { FC } from "react";
import { memo } from "react";
import { SearchAndFilter } from "@canonical/react-components";
import type {
  SearchAndFilterData,
  SearchAndFilterChip,
} from "@canonical/react-components/dist/components/SearchAndFilter/types";
import { useSearchParams } from "react-router-dom";
import type { LxdStorageBucket } from "types/storage";
import {
  paramsFromSearchData,
  searchParamsToChips,
} from "util/searchAndFilter";

export interface StorageBucketsFilterType {
  queries: string[];
  pools: string[];
}

interface Props {
  buckets: LxdStorageBucket[];
}

export const QUERY = "query";
export const POOL = "pool";

const QUERY_PARAMS = [QUERY, POOL];

const StorageBucketsFilter: FC<Props> = ({ buckets }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const pools = [...new Set(buckets.map((bucket) => bucket.pool))];

  const searchAndFilterData: SearchAndFilterData[] = [
    {
      id: 1,
      heading: "Pool",
      chips: pools.map((pool) => {
        return { lead: POOL, value: pool };
      }),
    },
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
    <div className="search-wrapper margin-right u-sv3">
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

export default memo(StorageBucketsFilter);
