import { FC, useEffect } from "react";
import { Col, Row } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { IdpGroup } from "types/permissions";
import IdentityProviderGroupUsedBy from "./IdentityProviderGroupUsedBy";

interface Props {
  group: IdpGroup;
}

const IdentityProviderGroupOverview: FC<Props> = ({ group }) => {
  const updateContentHeight = () => {
    updateMaxHeight("permission-group-overview");
  };
  useEffect(updateContentHeight, [group]);
  useEventListener("resize", updateContentHeight);

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
            </tbody>
          </table>
        </Col>
      </Row>
      <Row className="section">
        <Col size={3}>
          <h2 className="p-heading--5">
            Mapped LXD Groups ({group.groups?.length ?? 0})
          </h2>
        </Col>
        <Col size={7}>
          <IdentityProviderGroupUsedBy group={group} />
        </Col>
      </Row>
    </div>
  );
};

export default IdentityProviderGroupOverview;
