import type { FC } from "react";
import { memo } from "react";
import type { LxdInstance } from "types/instance";
import { instanceStatuses, instanceTypes } from "util/instanceFilter";
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
import { useIsClustered } from "context/useIsClustered";

export const QUERY = "query";
export const STATUS = "status";
export const TYPE = "type";
export const PROFILE = "profile";
export const CLUSTER_MEMBER = "member";
export const PROJECT = "project";

const QUERY_PARAMS = [QUERY, STATUS, TYPE, PROFILE, CLUSTER_MEMBER, PROJECT];

interface Props {
  instances: LxdInstance[];
  hasProjectFilter: boolean;
}

const InstanceSearchFilter: FC<Props> = ({ instances, hasProjectFilter }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isClustered = useIsClustered();

  const profileSet = [
    ...new Set(instances.flatMap((instance) => instance.profiles)),
  ];

  const locationSet = [
    ...new Set(instances.flatMap((instance) => instance.location)),
  ];

  const projectSet = [
    ...new Set(instances.flatMap((instance) => instance.project)),
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
    ...(isClustered
      ? [
          {
            id: 4,
            heading: "Cluster member",
            chips: locationSet.map((location) => {
              return { lead: CLUSTER_MEMBER, value: location };
            }),
          },
        ]
      : []),
    ...(hasProjectFilter
      ? [
          {
            id: 5,
            heading: "Project",
            chips: projectSet.map((project) => {
              return { lead: "project", value: project };
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

export default memo(InstanceSearchFilter);
