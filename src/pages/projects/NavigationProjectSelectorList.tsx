import type { Dispatch, FC, SetStateAction } from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@canonical/react-components";
import { useCurrentProject } from "context/useCurrentProject";
import type { LxdProject } from "types/project";
import { pluralize } from "util/helpers";
import { getProjectSwitchTarget, isGlobalPage } from "util/projects";
import { filterUsedByType } from "util/usedBy";

interface Props {
  projects: LxdProject[];
  onMount: (val: Dispatch<SetStateAction<string>>) => void;
  onClose: () => void;
}

const NavigationProjectSelectorList: FC<Props> = ({
  projects,
  onMount,
  onClose,
}): React.JSX.Element => {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const { setProjectName } = useCurrentProject();
  const isOnGlobalPage = isGlobalPage(location.pathname);

  onMount(setQuery);

  const getInstanceCount = (project: LxdProject) => {
    const count = filterUsedByType("instance", project.used_by).length;
    return `${count} ${pluralize("instance", count)}`;
  };

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
            {isOnGlobalPage ? (
              <Button
                onClick={() => {
                  setProjectName(project.name);
                  onClose();
                }}
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
              </Button>
            ) : (
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
            )}
          </div>
        ))}
    </div>
  );
};

export default NavigationProjectSelectorList;
