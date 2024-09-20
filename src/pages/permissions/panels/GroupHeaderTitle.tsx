import { FC } from "react";
import { LxdGroup } from "types/permissions";
import { GroupSubForm } from "pages/permissions/panels/CreateGroupPanel";
import { pluralize } from "util/instanceBulkActions";
import BackLink from "components/BackLink";

interface Props {
  subForm: GroupSubForm;
  setSubForm: (subForm: GroupSubForm) => void;
  group?: LxdGroup;
}

const GroupHeaderTitle: FC<Props> = ({ subForm, setSubForm, group }) => {
  if (subForm === null) {
    return group ? `Edit group ${group?.name}` : "Create group";
  }

  const verb = group ? "Edit" : "Add";

  return (
    <BackLink
      linkText={group ? "Edit group" : "Create group"}
      title={`${verb} ${pluralize(subForm, 2)}`}
      onClick={() => setSubForm(null)}
    />
  );
};

export default GroupHeaderTitle;
