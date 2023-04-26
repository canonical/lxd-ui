import React, { FC } from "react";
import { LxdUsedBy } from "util/usedBy";
import ExpandableList from "components/ExpandableList";
import InstanceLink from "pages/instances/InstanceLink";

interface Props {
  usedByInstances: LxdUsedBy[];
  alignRight?: boolean;
}

const ProfileUsedByRegularProject: FC<Props> = ({
  usedByInstances,
  alignRight = false,
}) => {
  return (
    <>
      {usedByInstances.length > 0 && (
        <tr>
          {alignRight && <th />}
          <td>
            <div className="list-wrapper">
              <ExpandableList
                items={usedByInstances.map((instance) => (
                  <div
                    key={instance.name}
                    className="u-truncate list-item non-default-project-item"
                    title={instance.name}
                  >
                    <InstanceLink instance={instance} />
                  </div>
                ))}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ProfileUsedByRegularProject;
