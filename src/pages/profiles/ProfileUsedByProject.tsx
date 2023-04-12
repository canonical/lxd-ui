import React, { FC } from "react";
import InstanceLink from "pages/instances/InstanceLink";
import { getProfileInstances } from "util/usedBy";
import ExpandableList from "components/ExpandableList";
import { LxdProfile } from "types/profile";

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

  const otherProjects = isDefaultProject
    ? [
        ...new Set(
          usedByInstances
            .filter((instance) => instance.project !== "default")
            .map((instance) => instance.project)
        ),
      ]
    : [];

  const usedByProjectList = isDefaultProject
    ? otherProjects.map((project) => {
        return {
          project: project,
          instances: usedByInstances.filter(
            (instance) => instance.project === project
          ),
        };
      })
    : [];

  if (isDefaultProject) {
    const defaultProjectInstances = usedByInstances.filter(
      (instance) => instance.project === "default"
    );
    if (defaultProjectInstances.length > 0) {
      usedByProjectList.unshift({
        project: "default",
        instances: defaultProjectInstances,
      });
    }
  }

  return (
    <>
      {usedByInstances.length === 0 && <>-</>}
      {usedByInstances.length > 0 && (
        <>
          {isDefaultProject && (
            <table>
              <tbody>
                {usedByProjectList.map((item) => (
                  <tr key={item.project} className="instances-by-project">
                    <th className="p-muted-heading">
                      <span title={item.project} className="u-truncate">
                        {item.project}
                      </span>{" "}
                      ({item.instances.length})
                    </th>
                    <td>
                      <ExpandableList
                        progressive
                        items={item.instances.map((instance) => (
                          <div
                            key={instance.name}
                            className="u-truncate list-item"
                            title={instance.name}
                          >
                            <InstanceLink instance={instance} />
                          </div>
                        ))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isDefaultProject && (
            <ExpandableList
              progressive
              items={usedByInstances.map((instance) => (
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
        </>
      )}
    </>
  );
};

export default ProfileUsedByProject;
