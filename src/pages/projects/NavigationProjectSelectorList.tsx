import { useState, type Dispatch, type FC, type SetStateAction } from "react";
import { Link, useLocation } from "react-router-dom";
import type { LxdProject } from "types/project";
import { getInstanceCount, getProjectSwitchTarget } from "util/projects";

interface Props {
  projects: LxdProject[];
  onMount: (val: Dispatch<SetStateAction<string>>) => void;
}

const NavigationProjectSelectorList: FC<Props> = ({
  projects,
  onMount,
}): React.JSX.Element => {
  const location = useLocation();
  const [query, setQuery] = useState("");

  onMount(setQuery);

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
              to={getProjectSwitchTarget(location.pathname, project.name)}
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

export default NavigationProjectSelectorList;
