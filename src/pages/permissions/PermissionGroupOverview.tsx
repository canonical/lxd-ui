import { FC, useEffect } from "react";
import { Col, Row } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { LxdGroup } from "types/permissions";
import PermissionGroupUsedby from "./PermissionGroupUsedby";
import { getIdentitiesForGroup } from "util/permissions";

interface Props {
  group: LxdGroup;
}

const PermissionGroupOverview: FC<Props> = ({ group }) => {
  const updateContentHeight = () => {
    updateMaxHeight("permission-group-overview");
  };
  useEffect(updateContentHeight, [group]);
  useEventListener("resize", updateContentHeight);

  const { totalIdentities } = getIdentitiesForGroup(group);

  return (
    <div className="permission-group-overview">
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">General</h2>
        </Col>
        <Col size={7}>
          <table>
            <tbody>
              <tr>
                <th className="p-muted-heading">Name</th>
                <td>{group.name}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Description</th>
                <td>{group.description}</td>
              </tr>
              <tr>
                <th className="p-muted-heading">Permissions</th>
                <td>{group.permissions?.length}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">Allocated to ({totalIdentities})</h2>
        </Col>
        <Col size={7}>
          <PermissionGroupUsedby group={group} />
        </Col>
      </Row>
    </div>
  );
};

export default PermissionGroupOverview;
