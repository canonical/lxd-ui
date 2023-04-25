import React, { FC } from "react";
import { LxdUsedBy } from "util/usedBy";
import ExpandableList from "components/ExpandableList";
import InstanceLink from "pages/instances/InstanceLink";

interface Props {
  affectedProjects?: {
    name: string;
    instances: LxdUsedBy[];
  }[];
  headingClassName?: string;
}

const ProfileUsedByDefaultProject: FC<Props> = ({
  affectedProjects,
  headingClassName,
}) => {
  return (
    <>
      {affectedProjects?.map((project) => (
        <tr key={project.name} className="instances-by-project list-wrapper">
          <th className={headingClassName}>
            <div className="flexible-container">
              <div title={project.name} className="u-truncate">
                {project.name}
              </div>
              <div className="u-float-right">({project.instances.length})</div>
            </div>
          </th>
          <td>
            {project.instances.length === 0 && (
              <i className="u-text--muted no-instances">No instances</i>
            )}
            {project.instances.length > 0 && (
              <ExpandableList
                items={project.instances.map((instance) => (
                  <div
                    key={instance.name}
                    className="u-truncate list-item"
                    title={instance.name}
                  >
                    <InstanceLink instance={instance} />
                  </div>
                ))}
              />
            )}
          </td>
        </tr>
      ))}
    </>
  );
};

export default ProfileUsedByDefaultProject;
