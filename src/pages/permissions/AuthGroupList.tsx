import type { FC } from "react";
import { List } from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  groups: string[];
}

const AuthGroupList: FC<Props> = ({ groups }) => {
  if (!groups.length) {
    return <span className="u-text--muted">-</span>;
  }

  return (
    <List
      items={groups.map((group) => (
        <ResourceLink
          key={group}
          type="auth-group"
          value={group}
          to={`${ROOT_PATH}/ui/permissions/groups`}
        />
      ))}
      className="u-no-margin--bottom"
    />
  );
};

export default AuthGroupList;
