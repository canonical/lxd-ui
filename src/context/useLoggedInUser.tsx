import { useSettings } from "./useSettings";
import { useIdentity } from "./useIdentities";
import { getIdentityName } from "util/permissionIdentities";

export const useLoggedInUser = () => {
  const { data: settings } = useSettings();

  const id = settings?.auth_user_name || "";
  const authMethod = settings?.auth_user_method || "";

  const identityQueryEnabled = !!id && !!authMethod;
  const { data: identity } = useIdentity(id, authMethod, identityQueryEnabled);

  return {
    loggedInUserName: getIdentityName(identity),
    loggedInUserID: id,
    authMethod,
  };
};
