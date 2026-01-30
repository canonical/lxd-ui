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
import { AUTH_METHOD } from "util/authentication";

export interface PermissionIdentitiesFilterType {
  queries: string[];
  authMethod: string[];
  systemIdentities: string | null;
}
export const QUERY = "query";
export const AUTH_METHOD_FILTER = "auth-method";
export const SYSTEM_IDENTITIES = "system-identities";

const authMethods: string[] = [AUTH_METHOD.TLS, AUTH_METHOD.OIDC];
const QUERY_PARAMS = [QUERY, AUTH_METHOD_FILTER, SYSTEM_IDENTITIES];

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
        return { lead: AUTH_METHOD_FILTER, value: method };
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
