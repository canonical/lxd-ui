import React, { FC } from "react";
import InstanceLink from "pages/instances/InstanceLink";
import { getProfileInstances } from "util/usedBy";
import ExpandableList from "components/ExpandableList";
import { LxdProfile } from "types/profile";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "api/projects";
import { queryKeys } from "util/queryKeys";
import classnames from "classnames";

interface Props {
  profile: LxdProfile;
  project: string;
  headingClassName?: string;
  hasTableParent?: boolean;
}

const ProfileUsedByProject: FC<Props> = ({
  profile,
  project,
  headingClassName,
  hasTableParent = false,
}) => {
  const isDefaultProject = project === "default";

  const usedByInstances = getProfileInstances(
    project,
    isDefaultProject,
    profile.used_by
  );

  const affectedProjects = isDefaultProject
    ? [
        {
          name: project,
          instances: usedByInstances.filter(
            (instance) => instance.project === project
          ),
        },
      ]
    : undefined;

  if (isDefaultProject) {
    const { data: projects = [] } = useQuery({
      queryKey: [queryKeys.projects, 1],
      queryFn: () => fetchProjects(1),
    });
    projects
      .filter((project) => project.config["features.profiles"] === "false")
      .map((project) => project.name)
      .forEach((project) =>
        affectedProjects?.push({
          name: project,
          instances: usedByInstances.filter(
            (instance) => instance.project === project
          ),
        })
      );
  }

  const tableRows = affectedProjects?.map((project) => (
    <tr
      key={project.name}
      className={classnames("instances-by-project", {
        "list-wrapper": hasTableParent,
      })}
    >
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
  ));

  return (
    <>
      {usedByInstances.length === 0 && (hasTableParent ? <></> : <>-</>)}
      {usedByInstances.length > 0 && (
        <>
          {isDefaultProject && hasTableParent && <>{tableRows}</>}
          {isDefaultProject && !hasTableParent && (
            <table>
              <tbody>{tableRows}</tbody>
            </table>
          )}
          {!isDefaultProject && (
            <div
              className={classnames({
                "list-wrapper": hasTableParent,
              })}
            >
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
          )}
        </>
      )}
    </>
  );
};

export default ProfileUsedByProject;
