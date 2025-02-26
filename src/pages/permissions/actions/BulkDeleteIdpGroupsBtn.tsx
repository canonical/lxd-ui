import type { FC } from "react";
import type { IdpGroup } from "types/permissions";
import { pluralize } from "util/instanceBulkActions";
import { useDeleteIdpGroups } from "util/permissionIdpGroups";
import BulkDeleteButton from "components/BulkDeleteButton";

interface Props {
  idpGroups: IdpGroup[];
}

const BulkDeleteIdpGroupsBtn: FC<Props> = ({ idpGroups }) => {
  const { deletableIdpGroups, restrictedIdpGroups, deleteIdpGroups } =
    useDeleteIdpGroups(idpGroups);

  const getBulkDeleteBreakdown = () => {
    if (!restrictedIdpGroups.length) {
      return undefined;
    }

    return [
      `${deletableIdpGroups.length} ${pluralize("IDP group", deletableIdpGroups.length)} will be deleted.`,
      `${restrictedIdpGroups.length} ${pluralize("IDP group", restrictedIdpGroups.length)} that you do not have permission to delete will be ignored.`,
    ];
  };

  return (
    <BulkDeleteButton
      entities={idpGroups}
      deletableEntities={deletableIdpGroups}
      entityType="IDP group"
      onDelete={deleteIdpGroups}
      disabledReason={
        !deletableIdpGroups.length
          ? `You do not have permission to delete the selected ${pluralize("idp group", idpGroups.length)}`
          : undefined
      }
      className="u-no-margin--bottom"
      buttonLabel={`Delete ${idpGroups.length} ${pluralize("IDP group", idpGroups.length)}`}
      bulkDeleteBreakdown={getBulkDeleteBreakdown()}
    />
  );
};

export default BulkDeleteIdpGroupsBtn;
