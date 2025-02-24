import { useSettings } from "./useSettings";
import { useIdentity } from "./useIdentities";

export const useLoggedInUser = () => {
  const { data: settings } = useSettings();

  const id = settings?.auth_user_name || "";
  const authMethod = settings?.auth_user_method || "";

  const identityQueryEnabled = !!id && !!authMethod;
  const { data: identity } = useIdentity(id, authMethod, identityQueryEnabled);

  return {
    loggedInUserName: identity?.name,
    loggedInUserID: id,
    authMethod,
  };
};
