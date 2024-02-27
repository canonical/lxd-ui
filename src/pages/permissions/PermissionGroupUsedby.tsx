import { FC } from "react";
import { Link } from "react-router-dom";
import ExpandableList from "components/ExpandableList";
import { LxdGroup } from "types/permissions";
import { getIdentitiesForGroup } from "util/permissions";

interface Props {
  group: LxdGroup;
}

const PermissionGroupUsedby: FC<Props> = ({ group }) => {
  const { oidcIdentities, tlsIdentities } = getIdentitiesForGroup(group);
  const data: Record<string, string[]> = {
    oidc: oidcIdentities,
    tls: tlsIdentities,
  };

  return (
    <table>
      <tbody>
        <tr>
          <th className="p-muted-heading">OIDC ({data.oidc.length})</th>
          <td>
            <ExpandableList
              items={data.oidc.map((item) => (
                <div key={`${item}`}>
                  <Link to={`/ui/permissions/identity/oidc/${item}`}>
                    {item}
                  </Link>
                </div>
              ))}
            />
          </td>
        </tr>
        <tr>
          <th className="p-muted-heading">TLS ({data.tls.length})</th>
          <td>
            <ExpandableList
              items={data.tls.map((item) => (
                <div key={`${item}`}>
                  <Link to={`/ui/permissions/identity/tls/${item}`}>
                    {item}
                  </Link>
                </div>
              ))}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default PermissionGroupUsedby;
