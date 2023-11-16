import React, { FC } from "react";
import { LxdInstance } from "types/instance";
import { instanceStatuses, instanceTypes } from "util/instanceFilter";
import { SearchAndFilter } from "@canonical/react-components";
import {
  SearchAndFilterChip,
  SearchAndFilterData,
} from "@canonical/react-components/dist/components/SearchAndFilter/types";
import { useSearchParams } from "react-router-dom";

const QUERY_PARAMS = ["query", "status", "type", "profile"];

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
    const searchValuesByLead = (lead: string) =>
      searchData
        .filter(
          (chip) => chip.lead === lead || (lead === "query" && chip.quoteValue),
        )
        .map((chip) => chip.value);

    const newParams = new URLSearchParams(searchParams.toString());

    QUERY_PARAMS.forEach((param) => {
      newParams.delete(param);
      searchValuesByLead(param).forEach((value) => {
        if (!newParams.has(param, value)) {
          newParams.append(param, value);
        }
      });
    });

    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams);
    }
  };

  const searchParamsToChips = () => {
    const searchData: SearchAndFilterChip[] = [];
    QUERY_PARAMS.forEach((param) =>
      searchData.push(
        ...searchParams
          .getAll(param)
          .map((value) =>
            param === "query"
              ? { quoteValue: true, value }
              : { lead: param, value },
          ),
      ),
    );
    return searchData;
  };

  return (
    <div className="search-wrapper margin-right u-no-margin--bottom">
      <SearchAndFilter
        existingSearchData={searchParamsToChips()}
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
