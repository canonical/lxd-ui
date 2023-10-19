import React, { FC, useEffect } from "react";
import { SearchAndFilter } from "@canonical/react-components";
import {
  SearchAndFilterData,
  SearchAndFilterChip,
} from "@canonical/react-components/dist/components/SearchAndFilter/types";
import { useLocation } from "react-router-dom";
import { LxdStorageVolume } from "types/storage";

interface StorageFilterState {
  state?: {
    appliedPool: string;
  };
}

export interface StorageVolumesFilterType {
  queries: string[];
  pools: string[];
  volumeTypes: string[];
  contentTypes: string[];
}

interface Props {
  volumes: LxdStorageVolume[];
  setFilters: (newFilters: StorageVolumesFilterType) => void;
}

const volumeTypes: string[] = [
  "container",
  "virtual-machine",
  "snapshot",
  "image",
  "custom",
];

const contentTypes: string[] = ["block", "filesystem", "iso"];

const POOL = "Pool";
const VOLUME_TYPE = "Volume type";
const CONTENT_TYPE = "Content type";

const StorageVolumesFilter: FC<Props> = ({ volumes, setFilters }) => {
  const { state } = useLocation() as StorageFilterState;

  useEffect(() => window.history.replaceState({}, ""), [state]);

  const pools = [...new Set(volumes.map((volume) => volume.pool))];

  const searchAndFilterData: SearchAndFilterData[] = [
    {
      id: 1,
      heading: POOL,
      chips: pools.map((pool) => {
        return { lead: POOL, value: pool };
      }),
    },
    {
      id: 2,
      heading: VOLUME_TYPE,
      chips: volumeTypes.map((volumeType) => {
        return { lead: VOLUME_TYPE, value: volumeType };
      }),
    },
    {
      id: 3,
      heading: CONTENT_TYPE,
      chips: contentTypes.map((contentType) => {
        return { lead: CONTENT_TYPE, value: contentType };
      }),
    },
  ];

  const onSearchDataChange = (searchData: SearchAndFilterChip[]) => {
    const getChipValue = (lead: string) =>
      searchData.filter((chip) => chip.lead === lead).map((chip) => chip.value);

    setFilters({
      queries: searchData
        .filter((chip) => chip.quoteValue)
        .map((chip) => chip.value.toLowerCase()),
      pools: getChipValue(POOL),
      volumeTypes: getChipValue(VOLUME_TYPE),
      contentTypes: getChipValue(CONTENT_TYPE),
    });
  };

  return (
    <div className="search-wrapper margin-right u-sv3">
      <SearchAndFilter
        existingSearchData={
          state?.appliedPool
            ? [
                {
                  lead: POOL,
                  value: state.appliedPool,
                },
              ]
            : undefined
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

export default React.memo(StorageVolumesFilter);
