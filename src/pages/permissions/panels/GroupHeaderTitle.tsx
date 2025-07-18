import type { FC } from "react";
import type { LxdAuthGroup } from "types/permissions";
import type { GroupSubForm } from "pages/permissions/panels/CreateGroupPanel";
import { pluralize } from "util/instanceBulkActions";
import BackLink from "components/BackLink";

interface Props {
  subForm: GroupSubForm;
  setSubForm: (subForm: GroupSubForm) => void;
  group?: LxdAuthGroup;
}

const GroupHeaderTitle: FC<Props> = ({ subForm, setSubForm, group }) => {
  if (subForm === null) {
    return group ? `Edit auth group ${group?.name}` : "Create auth group";
  }

  const verb = group ? "Edit" : "Add";

  return (
    <BackLink
      linkText={group ? "Edit auth group" : "Create auth group"}
      title={`${verb} ${pluralize(subForm, 2)}`}
      onClick={() => {
        setSubForm(null);
      }}
    />
  );
};

export default GroupHeaderTitle;
