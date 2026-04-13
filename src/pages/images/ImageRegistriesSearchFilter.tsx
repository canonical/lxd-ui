import type { FC } from "react";
import { memo } from "react";
import { SearchAndFilter } from "@canonical/react-components";
import type {
  SearchAndFilterChip,
  SearchAndFilterData,
} from "@canonical/react-components/dist/components/SearchAndFilter/types";
import { useSearchParams } from "react-router-dom";
import {
  paramsFromSearchData,
  searchParamsToChips,
} from "util/searchAndFilter";
import type { LxdImageRegistryProtocol } from "types/image";

export interface ImageRegistryFilter {
  queries: string[];
  protocol: LxdImageRegistryProtocol[];
  builtin: boolean[];
  public: boolean[];
}

export const QUERY = "query";
export const PROTOCOL = "protocol";
export const BUILTIN = "builtin";
export const PUBLIC = "public";

const QUERY_PARAMS = [QUERY, PROTOCOL, BUILTIN, PUBLIC];

const InstanceSearchFilter: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchAndFilterData: SearchAndFilterData[] = [
    {
      id: 1,
      heading: "Protocol",
      chips: ["SimpleStreams", "LXD"].map((protocol) => {
        return { lead: PROTOCOL, value: protocol.toLowerCase() };
      }),
    },
    {
      id: 2,
      heading: "Built-in",
      chips: ["Yes", "No"].map((type) => {
        return { lead: BUILTIN, value: type };
      }),
    },
    {
      id: 3,
      heading: "Public",
      chips: ["Yes", "No"].map((type) => {
        return { lead: PUBLIC, value: type };
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
    <>
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
    </>
  );
};

export default memo(InstanceSearchFilter);
