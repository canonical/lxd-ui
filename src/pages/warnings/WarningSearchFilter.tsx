import { memo, type FC } from "react";
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
import {
  enhanceSeverityChipWithAppearance,
  getSeverityChipAppearance,
  warningSeverities,
  SEVERITY,
  STATUS,
  WARNING_QUERY_PARAMS,
  warningStatuses,
} from "util/warnings";

const WarningSearchFilter: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchAndFilterData: SearchAndFilterData[] = [
    {
      id: 1,
      heading: "Status",
      chips: warningStatuses.map((status) => {
        return { lead: STATUS, value: status };
      }),
    },
    {
      id: 2,
      heading: "Severity",
      chips: warningSeverities.map((severity) => {
        return {
          lead: SEVERITY,
          value: severity,
          appearance: getSeverityChipAppearance(severity),
        };
      }),
    },
  ];

  const onSearchDataChange = (searchData: SearchAndFilterChip[]) => {
    const newParams = paramsFromSearchData(
      searchData,
      searchParams,
      WARNING_QUERY_PARAMS,
    );

    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams);
    }
  };

  return (
    <>
      <h2 className="u-off-screen">Search and filter</h2>
      <SearchAndFilter
        existingSearchData={searchParamsToChips(
          searchParams,
          WARNING_QUERY_PARAMS,
          enhanceSeverityChipWithAppearance,
        )}
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

export default memo(WarningSearchFilter);
