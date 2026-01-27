import { useSettings } from "./useSettings";
import { useIdentity } from "./useIdentities";
import { getIdentityName } from "util/permissionIdentities";
import { AUTH_METHOD } from "util/authentication";
import { useAuth } from "context/auth";

export const useLoggedInUser = () => {
  const { data: settings } = useSettings();
  const { authMethod } = useAuth();

  const id = settings?.auth_user_name || "";

  const identityQueryEnabled =
    !!id && !!authMethod && authMethod !== AUTH_METHOD.UNIX;
  const { data: identity } = useIdentity(
    id,
    authMethod || "",
    identityQueryEnabled,
  );

  return {
    loggedInUserName:
      authMethod === AUTH_METHOD.UNIX ? id : getIdentityName(identity),
    loggedInUserID: id,
  };
};
