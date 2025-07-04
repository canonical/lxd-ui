import type { AbortControllerState } from "./helpers";
import { checkDuplicateName } from "./helpers";
import type * as Yup from "yup";
import { deleteIdpGroups } from "api/auth-idp-groups";
import { useNotify, useToastNotification } from "@canonical/react-components";
import { useState } from "react";
import { useIdpGroupEntitlements } from "util/entitlements/idp-groups";
import ResourceLabel from "components/ResourceLabel";
import { pluralize } from "util/instanceBulkActions";
import { useQueryClient } from "@tanstack/react-query";
import type { IdpGroup } from "types/permissions";
import { queryKeys } from "./queryKeys";

export const testDuplicateIdpGroupName = (
  controllerState: AbortControllerState,
  excludeName?: string,
): [string, string, Yup.TestFunction<string | undefined, Yup.AnyObject>] => {
  return [
    "deduplicate",
    "An identity provider group with this name already exists",
    async (value?: string) => {
      return (
        (excludeName && value === excludeName) ||
        checkDuplicateName(
          value,
          "",
          controllerState,
          "auth/identity-provider-groups",
        )
      );
    },
  ];
};

export const useDeleteIdpGroups = (idpGroups: IdpGroup[]) => {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isDeleting, setIsDeleting] = useState(false);
  const { canDeleteIdpGroup } = useIdpGroupEntitlements();

  const restrictedGroups: IdpGroup[] = [];
  const deletableGroups: IdpGroup[] = [];
  idpGroups.forEach((group) => {
    if (canDeleteIdpGroup(group)) {
      deletableGroups.push(group);
    } else {
      restrictedGroups.push(group);
    }
  });

  const hasOneGroup = deletableGroups.length === 1;

  const handleDeleteIdpGroups = () => {
    setIsDeleting(true);

    const successMessage = hasOneGroup ? (
      <>
        IDP group{" "}
        <ResourceLabel bold type="idp-group" value={deletableGroups[0].name} />{" "}
        deleted.
      </>
    ) : (
      `${deletableGroups.length} IDP groups deleted.`
    );

    deleteIdpGroups(deletableGroups.map((group) => group.name))
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.idpGroups],
        });
        toastNotify.success(successMessage);
      })
      .catch((e) => {
        notify.failure(
          `${pluralize("IDP group", deletableGroups.length)} deletion failed`,
          e,
        );
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return {
    deleteIdpGroups: handleDeleteIdpGroups,
    isDeleting,
    restrictedIdpGroups: restrictedGroups,
    deletableIdpGroups: deletableGroups,
  };
};
