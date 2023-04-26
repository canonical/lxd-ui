import React, { FC } from "react";
import { getProfileInstances } from "util/usedBy";
import { LxdProfile } from "types/profile";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "api/projects";
import { queryKeys } from "util/queryKeys";
import ProfileUsedByDefaultProject from "./ProfileUsedByDefaultProject";
import ProfileUsedByRegularProject from "./ProfileUsedByRegularProject";

interface Props {
  profile: LxdProfile;
  project: string;
  headingClassName?: string;
  alignRight?: boolean;
}

const ProfileInstances: FC<Props> = ({
  profile,
  project,
  headingClassName,
  alignRight,
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

  return isDefaultProject ? (
    <ProfileUsedByDefaultProject
      affectedProjects={affectedProjects}
      headingClassName={headingClassName}
    />
  ) : (
    <ProfileUsedByRegularProject
      usedByInstances={usedByInstances}
      alignRight={alignRight}
    />
  );
};

export default ProfileInstances;
