import { FC } from "react";
import { LxdUsedBy } from "util/usedBy";
import ViewProfileInstancesLink from "./actions/ViewProfileInstancesLink";

interface Props {
  profile: string;
  affectedProjects?: {
    name: string;
    instances: LxdUsedBy[];
  }[];
  headingClassName?: string;
}

const ProfileUsedByDefaultProject: FC<Props> = ({
  profile,
  affectedProjects,
  headingClassName,
}) => {
  return (
    <>
      {affectedProjects?.map((project) => (
        <tr key={project.name} className="instances-by-project list-wrapper">
          <th className={headingClassName}>
            <div className="flexible-container">
              <div className="u-truncate" title={`Project ${project.name}`}>
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
              <ViewProfileInstancesLink
                profile={profile}
                project={project.name}
              />
            )}
          </td>
        </tr>
      ))}
    </>
  );
};

export default ProfileUsedByDefaultProject;
