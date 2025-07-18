import type { FC } from "react";
import { Col, Row } from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import type { LxdClusterMember } from "types/cluster";
import ClusterMemberStatus from "pages/cluster/ClusterMemberStatus";

interface Props {
  member: LxdClusterMember;
}

const ClusterMemberOverview: FC<Props> = ({ member }) => {
  return (
    <Row className="general">
      <Col size={3}>
        <h2 className="p-heading--5">General</h2>
      </Col>
      <Col size={7}>
        <table>
          <tbody>
            <tr>
              <th className="u-text--muted">Server name</th>
              <td>{member.server_name}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Description</th>
              <td>{member.description || "-"}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Status</th>
              <td>
                <ClusterMemberStatus status={member.status} />
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">Message</th>
              <td>{member.message}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Url</th>
              <td>{member.url}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Roles</th>
              <td>{member.roles.join(", ")}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Groups</th>
              <td>
                {member.groups?.map((group) => (
                  <>
                    <ResourceLink
                      type="cluster-group"
                      value={group}
                      to="/ui/cluster/groups"
                      key={group}
                    />{" "}
                  </>
                )) ?? "-"}
              </td>
            </tr>
            <tr>
              <th className="u-text--muted">Architecture</th>
              <td>{member.architecture}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Failure domain</th>
              <td>{member.failure_domain}</td>
            </tr>
          </tbody>
        </table>
      </Col>
    </Row>
  );
};

export default ClusterMemberOverview;
