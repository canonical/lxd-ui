import { useQuery } from "@tanstack/react-query";
import { useSettings } from "./useSettings";
import { fetchIdentity } from "api/auth-identities";
import { queryKeys } from "util/queryKeys";

export const useLoggedInUser = () => {
  const { data: settings } = useSettings();

  const id = settings?.auth_user_name || "";
  const authMethod = settings?.auth_user_method || "";

  const { data: identity } = useQuery({
    queryKey: [queryKeys.identities, id],
    queryFn: () => fetchIdentity(id, authMethod),
    enabled: !!id && !!authMethod,
  });

  return {
    loggedInUserName: identity?.name,
    loggedInUserID: id,
    authMethod,
  };
};
