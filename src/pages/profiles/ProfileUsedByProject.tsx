import React, { FC } from "react";
import InstanceLink from "pages/instances/InstanceLink";
import { getProfileInstances } from "util/usedBy";
import ExpandableList from "components/ExpandableList";
import { LxdProfile } from "types/profile";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "api/projects";
import { queryKeys } from "util/queryKeys";

interface Props {
  profile: LxdProfile;
  project: string;
}

const ProfileUsedByProject: FC<Props> = ({ profile, project }) => {
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

  return (
    <>
      {usedByInstances.length === 0 && <>-</>}
      {usedByInstances.length > 0 && (
        <>
          {isDefaultProject && (
            <table>
              <tbody>
                {affectedProjects?.map((project) => (
                  <tr key={project.name} className="instances-by-project">
                    <th className="p-muted-heading">
                      <span title={project.name} className="u-truncate">
                        {project.name}
                      </span>{" "}
                      ({project.instances.length})
                    </th>
                    <td>
                      {project.instances.length === 0 && (
                        <i className="u-text--muted">No instances</i>
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
              </tbody>
            </table>
          )}
          {!isDefaultProject && (
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
          )}
        </>
      )}
    </>
  );
};

export default ProfileUsedByProject;
