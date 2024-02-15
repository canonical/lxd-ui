import { FC, memo } from "react";
import { LxdInstance } from "types/instance";
import { instanceStatuses, instanceTypes } from "util/instanceFilter";
import { SearchAndFilter } from "@canonical/react-components";
import {
  SearchAndFilterChip,
  SearchAndFilterData,
} from "@canonical/react-components/dist/components/SearchAndFilter/types";
import { useSearchParams } from "react-router-dom";
import {
  paramsFromSearchData,
  searchParamsToChips,
} from "util/searchAndFilter";

export const QUERY = "query";
export const STATUS = "status";
export const TYPE = "type";
export const PROFILE = "profile";

const QUERY_PARAMS = [QUERY, STATUS, TYPE, PROFILE];

interface Props {
  instances: LxdInstance[];
}

const InstanceSearchFilter: FC<Props> = ({ instances }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const profileSet = [
    ...new Set(instances.flatMap((instance) => instance.profiles)),
  ];

  const searchAndFilterData: SearchAndFilterData[] = [
    {
      id: 1,
      heading: "Status",
      chips: instanceStatuses.map((status) => {
        return { lead: STATUS, value: status };
      }),
    },
    {
      id: 2,
      heading: "Instance type",
      chips: instanceTypes.map((type) => {
        return { lead: TYPE, value: type };
      }),
    },
    {
      id: 3,
      heading: "Profile",
      chips: profileSet.map((profile) => {
        return { lead: PROFILE, value: profile };
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
