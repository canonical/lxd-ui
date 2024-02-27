import { FC } from "react";
import { Link } from "react-router-dom";
import ExpandableList from "components/ExpandableList";
import { IdpGroup } from "types/permissions";

interface Props {
  group: IdpGroup;
}

const IdentityProviderGroupUsedBy: FC<Props> = ({ group }) => {
  const data: Record<string, string[]> = {
    groups: group.groups || [],
  };

  return (
    <table>
      <tbody>
        <tr>
          <th className="p-muted-heading">
            Mapped LXD Groups ({data.groups.length})
          </th>
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

export default IdentityProviderGroupUsedBy;
