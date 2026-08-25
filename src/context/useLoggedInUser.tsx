import { useSettings } from "./useSettings";
import { getIdentityName } from "util/permissionIdentities";
import { AUTH_METHOD } from "util/authentication";
import { useAuth } from "context/auth";

export const useLoggedInUser = () => {
  const { data: settings } = useSettings();
  const { authMethod, currentIdentity } = useAuth();

  const id = settings?.auth_user_name || "";

  return {
    loggedInUserName:
      authMethod === AUTH_METHOD.UNIX || !currentIdentity
        ? id
        : getIdentityName(currentIdentity),
    loggedInUserID: id,
  };
};
