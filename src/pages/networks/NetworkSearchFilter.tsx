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
import { useClusterMembers } from "context/useClusterMembers";

export const QUERY = "query";
export const TYPE = "type";
export const MANAGED = "managed";
export const MEMBER = "member";
export const STATE = "state";

const QUERY_PARAMS = [QUERY, TYPE, MANAGED, MEMBER, STATE];

export interface NetworkFilters {
  queries: string[];
  type: string[];
  managed: string[];
  member: string[];
  state: string[];
}

const NetworkSearchFilter: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: clusterMembers = [] } = useClusterMembers();

  const memberSet = [
    ...new Set(clusterMembers.map((member) => member.server_name)),
  ];

  const searchAndFilterData: SearchAndFilterData[] = [
    {
      id: 1,
      heading: "Type",
      chips: ["OVN", "Bridge", "Physical"].map((type) => {
        return { lead: TYPE, value: type };
      }),
    },
    {
      id: 2,
      heading: "Managed",
      chips: ["Yes", "No"].map((managed) => {
        return { lead: MANAGED, value: managed };
      }),
    },
    {
      id: 3,
      heading: "State",
      chips: ["Created", "Pending", "Unknown", "Unavailable", "Errored"].map(
        (state) => {
          return { lead: STATE, value: state };
        },
      ),
    },
    ...(clusterMembers.length > 0
      ? [
          {
            id: 4,
            heading: "Cluster member",
            chips: ["Cluster-wide"].concat(memberSet).map((location) => {
              return { lead: MEMBER, value: location };
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

export default memo(NetworkSearchFilter);
