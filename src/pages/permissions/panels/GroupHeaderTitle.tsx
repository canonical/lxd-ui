import { Button, Icon } from "@canonical/react-components";
import React, { FC } from "react";
import { LxdGroup } from "types/permissions";
import { GroupSubForm } from "pages/permissions/panels/CreateGroupPanel";
import { pluralize } from "util/instanceBulkActions";

interface Props {
  subForm: GroupSubForm;
  setSubForm: (subForm: GroupSubForm) => void;
  group?: LxdGroup;
}

const GroupHeaderTitle: FC<Props> = ({ subForm, setSubForm, group }) => {
  if (subForm === null) {
    return group ? `Edit group ${group?.name}` : "Create group";
  }

  const backLink = (
    <>
      <Icon name="chevron-left" />{" "}
      <Button
        onClick={() => setSubForm(null)}
        dense
        appearance="link"
        className="p-heading--4"
      >
        {group ? "Edit group" : "Create group"}
      </Button>
    </>
  );

  const verb = group ? "Edit" : "Add";

  return (
    <>
      {backLink} / {verb} {pluralize(subForm, 2)}
    </>
  );
};

export default GroupHeaderTitle;
