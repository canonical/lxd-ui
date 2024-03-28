import { FC } from "react";
import { Link } from "react-router-dom";
import ExpandableList from "components/ExpandableList";
import { LxdIdentity } from "types/permissions";

interface Props {
  identity: LxdIdentity;
}

const PermissionIdentityUsedBy: FC<Props> = ({ identity }) => {
  const data: Record<string, string[]> = {
    groups: identity.groups || [],
  };

  return (
    <table>
      <tbody>
        <tr>
          <th className="p-muted-heading">GROUPS ({data.groups.length})</th>
          <td>
            <ExpandableList
              items={data.groups.map((item) => (
                <div key={`${item}`}>
                  <Link to={`/ui/permissions/lxd-group/${item}`}>{item}</Link>
                </div>
              ))}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default PermissionIdentityUsedBy;
