import React, { FC } from "react";
import { LxdInstance, LxdInstanceStatus } from "types/instance";
import {
  InstanceFilters,
  enrichStatuses,
  instanceStatuses,
  instanceTypes,
} from "util/instanceFilter";
import { SearchAndFilter } from "@canonical/react-components";
import {
  SearchAndFilterData,
  SearchAndFilterChip,
} from "@canonical/react-components/dist/components/SearchAndFilter/types";

interface Props {
  instances: LxdInstance[];
  setFilters: (newFilters: InstanceFilters) => void;
}

const InstanceSearchFilter: FC<Props> = ({ instances, setFilters }) => {
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

  const onSearchDataChange = (searchData: SearchAndFilterChip[]) => {
    setFilters({
      queries: searchData
        .filter((chip) => chip.quoteValue)
        .map((chip) => chip.value.toLowerCase()),
      statuses: enrichStatuses(
        searchData
          .filter((chip) => chip.lead === "status")
          .map((chip) => chip.value as LxdInstanceStatus)
      ),
      types: searchData
        .filter((chip) => chip.lead === "type")
        .map((chip) => (chip.value === "VM" ? "virtual-machine" : "container")),
      profileQueries: searchData
        .filter((chip) => chip.lead === "profile")
        .map((chip) => chip.value),
    });
  };

  return (
    <div className="search-wrapper margin-right u-no-margin--bottom">
      <SearchAndFilter
        filterPanelData={searchAndFilterData}
        returnSearchData={onSearchDataChange}
      />
    </div>
  );
};

export default React.memo(InstanceSearchFilter);
