import React, { Dispatch, FC, SetStateAction, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LxdProject } from "types/project";
import { getSubpageFromUrl } from "util/projects";
import { filterUsedByType } from "util/usedBy";

interface Props {
  projects: LxdProject[];
  onMount: (val: Dispatch<SetStateAction<string>>) => void;
}

const ProjectSelectorList: FC<Props> = ({ projects, onMount }): JSX.Element => {
  const location = useLocation();
  const [query, setQuery] = useState("");

  onMount(setQuery);

  const targetSection = getSubpageFromUrl(location.pathname) ?? "instances";

  function getInstanceCount(project: LxdProject) {
    const count = filterUsedByType("instances", "", project.used_by).length;
    return count === 1 ? "1 instance" : `${count} instances`;
  }

  return (
    <div className="projects">
      {projects
        .filter((project) => {
          if (!query) {
            return true;
          }
          const q = query.toLowerCase();
          if (project.name.toLowerCase().includes(q)) {
            return true;
          }
          if (project.description.toLowerCase().includes(q)) {
            return true;
          }
          return false;
        })
        .map((project) => (
          <div key={project.name} className="p-contextual-menu__group">
            <Link
              to={`/ui/project/${project.name}/${targetSection}`}
              className="p-contextual-menu__link link"
            >
              <div title={project.name} className="u-truncate name">
                {project.name}
              </div>
              <div className="p-text--x-small u-float-right u-no-margin--bottom count">
                {getInstanceCount(project)}
              </div>
              <br />
              <div
                className="p-text--x-small u-no-margin--bottom u-truncate description"
                title={project.description}
              >
                {project.description || "-"}
              </div>
            </Link>
          </div>
        ))}
    </div>
  );
};

export default ProjectSelectorList;
