import type { SearchAndFilterChip } from "@canonical/react-components/dist/components/SearchAndFilter/types";

export const paramsFromSearchData = (
  searchData: SearchAndFilterChip[],
  searchParams: URLSearchParams,
  queryParams: string[],
): URLSearchParams => {
  const newParams = new URLSearchParams(searchParams.toString());

  queryParams.forEach((param) => {
    newParams.delete(param);
    searchValuesByLead(searchData, param).forEach((value) => {
      newParams.append(param, value);
    });
  });

  return newParams;
};

const searchValuesByLead = (
  searchData: SearchAndFilterChip[],
  lead: string,
): string[] =>
  searchData
    .filter(
      (chip) => chip.lead === lead || (lead === "query" && chip.quoteValue),
    )
    .map((chip) => chip.value);

export const searchParamsToChips = (
  searchParams: URLSearchParams,
  queryParams: string[],
): SearchAndFilterChip[] => {
  const searchData: SearchAndFilterChip[] = [];
  queryParams.forEach((param) =>
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

export const searchChipBaseUrl = (
  searchParams: URLSearchParams,
  preserveParams: string[],
): string => {
  let url = `${window.location.pathname}?search=${Number(searchParams.get("search")) + 1}`;
  const appendExistingSearchParams = (field: string) => {
    searchParams.getAll(field).forEach((item) => (url += `&${field}=${item}`));
  };
  preserveParams.forEach(appendExistingSearchParams);
  return url;
};
