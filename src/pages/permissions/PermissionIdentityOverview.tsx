import { FC, useEffect } from "react";
import { Col, Row } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { LxdIdentity } from "types/permissions";
import PermissionIdentityGroupsBy from "./PermissionIdentityGroupsBy";
import { Link } from "react-router-dom";

interface Props {
  identity: LxdIdentity;
}

const PermissionIdentityOverview: FC<Props> = ({ identity }) => {
  const updateContentHeight = () => {
    updateMaxHeight("permission-identity-overview");
  };
  useEffect(updateContentHeight, [identity]);
  useEventListener("resize", updateContentHeight);

  return (
    <div className="permission-identity-overview">
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">General</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="p-muted-heading">ID</th>
                <td className="u-truncate" title={`id: ${identity.id}`}>
                  {identity.id}
                </td>
              </tr>
              <tr>
                <th className="p-muted-heading">Authentication method</th>
                <td>{identity.authentication_method}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Type</th>
                <td>{identity.type}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row className="section">
        <Col size={3}>
          <Link to="ui/permissions/lxd-groups">
            <h2 className="p-heading--5">
              Groups ({identity.groups?.length ?? 0})
            </h2>
          </Link>
        </Col>
        <Col size={7}>
          <PermissionIdentityGroupsBy identity={identity} />
        </Col>
      </Row>
    </div>
  );
};

export default PermissionIdentityOverview;
