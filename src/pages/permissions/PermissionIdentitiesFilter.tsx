import type { FC } from "react";
import { memo } from "react";
import { SearchAndFilter } from "@canonical/react-components";
import type {
  SearchAndFilterData,
  SearchAndFilterChip,
} from "@canonical/react-components/dist/components/SearchAndFilter/types";
import { useSearchParams } from "react-router-dom";
import {
  paramsFromSearchData,
  searchParamsToChips,
} from "util/searchAndFilter";
import type { LxdIdentity } from "types/permissions";

export interface PermissionIdentitiesFilterType {
  queries: string[];
  authMethod: string[];
  systemIdentities: string | null;
}
export const QUERY = "query";
export const AUTH_METHOD = "auth-method";
export const SYSTEM_IDENTITIES = "system-identities";

const authMethods: string[] = ["tls", "oidc"];
const QUERY_PARAMS = [QUERY, AUTH_METHOD, SYSTEM_IDENTITIES];

export const isSystemIdentity = (identity: LxdIdentity) => {
  return (
    identity.type.startsWith("Server certificate") ||
    identity.type.startsWith("Metrics certificate")
  );
};

const PermissionIdentitiesFilter: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchAndFilterData: SearchAndFilterData[] = [
    {
      id: 1,
      heading: "Auth method",
      chips: authMethods.map((method) => {
        return { lead: AUTH_METHOD, value: method };
      }),
    },
    {
      id: 2,
      heading: "System identities",
      chips: [{ lead: SYSTEM_IDENTITIES, value: "hide" }],
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

export default memo(PermissionIdentitiesFilter);
