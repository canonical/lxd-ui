import React, { FC, useEffect } from "react";
import { LxdInstance, LxdInstanceStatus } from "types/instance";
import { instanceStatuses, instanceTypes } from "util/instanceFilter";
import { SearchAndFilter } from "@canonical/react-components";
import {
  SearchAndFilterData,
  SearchAndFilterChip,
} from "@canonical/react-components/dist/components/SearchAndFilter/types";
import { useLocation, useSearchParams } from "react-router-dom";

interface ProfileFilterState {
  state?: {
    appliedProfile: string;
  };
}

interface Props {
  instances: LxdInstance[];
}

const InstanceSearchFilter: FC<Props> = ({ instances }) => {
  const { state } = useLocation() as ProfileFilterState;
  useEffect(() => window.history.replaceState({}, ""), [state]);

  const profileSet = [
    ...new Set(instances.flatMap((instance) => instance.profiles)),
  ];

  const searchAndFilterData: SearchAndFilterData[] = [
    {
      id: 1,
      heading: "Status",
      chips: instanceStatuses.map((status) => {
        return { lead: "status", value: status };
      }),
    },
    {
      id: 2,
      heading: "Instance type",
      chips: instanceTypes.map((type) => {
        return { lead: "type", value: type };
      }),
    },
    {
      id: 3,
      heading: "Profile",
      chips: profileSet.map((profile) => {
        return { lead: "profile", value: profile };
      }),
    },
  ];
  const setSearchParams = useSearchParams()[1];
  const onSearchDataChange = (searchData: SearchAndFilterChip[]) => {
    const filteredQueries = searchData
      .filter((chip) => chip.quoteValue === true || chip.lead === "query")
      .map((chip) => chip.value.toLowerCase());

    const filteredStatuses = searchData
      .filter((chip) => chip.lead === "status")
      .map((chip) => chip.value as LxdInstanceStatus);
    const filteredTypes = searchData
      .filter((chip) => chip.lead === "type")
      .map((chip) => chip.value);

    const profileQueries = searchData
      .filter((chip) => chip.lead === "profile")
      .map((chip) => chip.value);

    const currentWindowSearchParams = new URLSearchParams(
      window.location.search,
    );
    const newSearchParams = new URLSearchParams();
    filteredQueries.forEach((query) => {
      newSearchParams.append("q", query);
    });

    filteredStatuses.forEach((status) => {
      newSearchParams.append("status", status);
    });

    filteredTypes.forEach((type) => {
      newSearchParams.append("type", type);
    });
    profileQueries.forEach((profile) => {
      newSearchParams.append("profile", profile);
    });
    if (newSearchParams.toString() !== currentWindowSearchParams.toString()) {
      setSearchParams(newSearchParams);
    }
  };

  const getChips = (): SearchAndFilterChip[] => {
    const searchParams = new URLSearchParams(window.location.search);
    const statusChipUrl = [
      ...(searchParams.getAll("status") as LxdInstanceStatus[]).map(
        (status) => ({
          lead: "status",
          value: status,
        }),
      ),
    ];

    const newSearchData = [
      ...searchParams
        .getAll("q")
        .map((query) => ({ lead: "query", value: query })),
      ...statusChipUrl,
      ...searchParams
        .getAll("type")
        .map((type) => ({ lead: "type", value: type })),
      ...searchParams
        .getAll("profile")
        .map((profile) => ({ lead: "profile", value: profile })),
    ];

    return newSearchData;
  };

  return (
    <div className="search-wrapper margin-right u-no-margin--bottom">
      <SearchAndFilter
        existingSearchData={
          state?.appliedProfile
            ? [
                {
                  lead: "profile",
                  value: state.appliedProfile,
                },
              ]
            : getChips()
        }
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

export default React.memo(InstanceSearchFilter);
