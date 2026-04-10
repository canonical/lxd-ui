import type { FC } from "react";
import { memo, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchAndFilter } from "@canonical/react-components";
import type {
  SearchAndFilterData,
  SearchAndFilterChip,
} from "@canonical/react-components/dist/components/SearchAndFilter/types";
import type { LxdImage, LxdImageType } from "types/image";
import { getArchitectureDisplayName } from "util/architectures";
import { instanceCreationTypes } from "util/instanceOptions";

export interface ImagesSearchFilterType {
  queries: string[];
  arch: string[];
  type: string[];
}

export const QUERY = "query";
export const ARCHITECTURE = "arch";
export const TYPE = "type";
const QUERY_PARAMS = [QUERY, ARCHITECTURE, TYPE];

interface Props {
  images?: LxdImage[];
  supportedArchitectures: string[];
  isImagesLoading: boolean;
}

const ImagesSearchFilter: FC<Props> = ({
  images,
  supportedArchitectures,
  isImagesLoading,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialized = useRef(false);

  const availableArchitectures = useMemo(() => {
    return [...new Set((images ?? []).map((image) => image.architecture))];
  }, [images]);

  const availableTypes = useMemo(() => {
    const uniqueTypes = [
      ...new Set(
        (images ?? [])
          .map((image) => image.type)
          .filter((type): type is LxdImageType => Boolean(type)),
      ),
    ];

    return uniqueTypes.map((type) => {
      const typeOption = instanceCreationTypes.find(
        (option) => option.value === type,
      );
      return typeOption?.label ?? type;
    });
  }, [images]);

  useEffect(() => {
    if (
      initialized.current ||
      isImagesLoading ||
      availableArchitectures.length === 0
    ) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (
      params.getAll(ARCHITECTURE).length === 0 &&
      params.getAll(QUERY).length === 0 &&
      params.getAll(TYPE).length === 0
    ) {
      const defaults = supportedArchitectures.filter((arch) =>
        availableArchitectures.includes(arch),
      );

      if (defaults.length > 0) {
        initialized.current = true;
        setSearchParams(
          (prev) => {
            defaults.forEach((arch) => {
              prev.append(ARCHITECTURE, getArchitectureDisplayName(arch));
            });
            return prev;
          },
          { replace: true },
        );
      }
    } else {
      initialized.current = true;
    }
  }, [
    availableArchitectures,
    supportedArchitectures,
    isImagesLoading,
    setSearchParams,
  ]);

  const chips = useMemo(() => {
    // Custom implementation to preserve selection order
    const orderedChips: SearchAndFilterChip[] = [];

    // Iterate through URL params in their actual order to preserve selection sequence
    for (const [key, value] of searchParams.entries()) {
      if (QUERY_PARAMS.includes(key)) {
        const chip =
          key === "query" ? { quoteValue: true, value } : { lead: key, value };

        orderedChips.push(chip);
      }
    }

    return orderedChips;
  }, [searchParams]);

  const searchAndFilterData: SearchAndFilterData[] = [
    {
      id: 1,
      heading: "Architecture",
      chips: availableArchitectures.map((arch) => ({
        lead: ARCHITECTURE,
        value: getArchitectureDisplayName(arch),
        label: getArchitectureDisplayName(arch),
      })),
    },
    {
      id: 2,
      heading: "Type",
      chips: availableTypes.map((type) => ({
        lead: TYPE,
        value: type,
      })),
    },
  ];

  const onSearchDataChange = (searchData: SearchAndFilterChip[]) => {
    const newParams = new URLSearchParams(searchParams.toString());
    QUERY_PARAMS.forEach((param) => {
      newParams.delete(param);
    });

    // Add parameters back in the order they appear in searchData (preserves selection order)
    searchData.forEach((chip) => {
      if (chip.lead && QUERY_PARAMS.includes(chip.lead)) {
        newParams.append(chip.lead, chip.value);
      } else if (chip.quoteValue) {
        newParams.append(QUERY, chip.value);
      }
    });

    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams);
    }
  };

  return (
    <>
      <h2 className="u-off-screen">Search and filter</h2>
      <SearchAndFilter
        key={searchParams.toString()}
        existingSearchData={chips}
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

export default memo(ImagesSearchFilter);
