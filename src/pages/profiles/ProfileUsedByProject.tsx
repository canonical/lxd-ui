import React, { FC } from "react";
import InstanceLink from "pages/instances/InstanceLink";
import { UsedByProject } from "util/usedBy";
import ExpandableList from "components/ExpandableList";

interface Props {
  usedByProjObj: UsedByProject;
}

const ProfileUsedByProject: FC<Props> = ({ usedByProjObj }) => {
  return (
    <tr className="instances-by-project">
      <th className="p-muted-heading">
        <span title={usedByProjObj.project} className="u-truncate">
          {usedByProjObj.project}
        </span>{" "}
        ({usedByProjObj.usedBys.length})
      </th>
      <td>
        <ExpandableList
          progressive
          items={usedByProjObj.usedBys.map((usedByObj) => (
            <div
              key={usedByObj.name}
              className="u-truncate list-item"
              title={usedByObj.name}
            >
              <InstanceLink
                instance={{ name: usedByObj.name, project: usedByObj.project }}
              />
            </div>
          ))}
        />
      </td>
    </tr>
  );
};

export default ProfileUsedByProject;
