import { FC } from "react";
import classnames from "classnames";
import { List } from "@canonical/react-components";
import { LxdGroup } from "types/permissions";
import DeletePermissionGroupBtn from "./DeletePermissionGroupBtn";
import PermissionGroupEditIdentitiesBtn from "./PermissionGroupEditIdentitiesBtn";

interface Props {
  group: LxdGroup;
  className?: string;
}

const PermissionGroupActions: FC<Props> = ({ group, className }) => {
  return (
    <List
      inline
      className={classnames(className, "actions-list")}
      items={[
        <PermissionGroupEditIdentitiesBtn key="add-identity" group={group} />,
        <DeletePermissionGroupBtn key="delete" group={group} />,
      ]}
    />
  );
};

export default PermissionGroupActions;
