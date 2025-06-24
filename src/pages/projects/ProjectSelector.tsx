import type { FC } from "react";
import { useRef } from "react";
import {
  Button,
  ContextualMenu,
  Icon,
  SearchBox,
} from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import ProjectSelectorList from "pages/projects/ProjectSelectorList";
import { defaultFirst } from "util/helpers";
import { useProjects } from "context/useProjects";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  activeProject: string;
}

const ProjectSelector: FC<Props> = ({ activeProject }): React.JSX.Element => {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const { canCreateProjects } = useServerEntitlements();

  const { data: projects = [] } = useProjects();

  projects.sort(defaultFirst);

  let updateQuery = (_val: string) => {
    /**/
  };

  // called when the children of the ContextualMenu become visible
  const onChildMount = (childSetQuery: (val: string) => void) => {
    updateQuery = childSetQuery;
    setTimeout(() => searchRef.current?.focus(), 100);
  };

  return (
    <>
      <div className="project-select-label">Project</div>
      <ContextualMenu
        dropdownProps={{ "aria-label": "select project" }}
        toggleClassName="toggle is-dark"
        toggleLabel={activeProject}
        hasToggleIcon
        title={`Select project (${activeProject})`}
        className="project-select is-dark"
      >
        <div className="list is-dark" key="my-div">
          {projects.length > 5 && (
            <SearchBox
              id="searchProjectSelector"
              key="searchProjectSelector"
              autoFocus={true}
              autocomplete="off"
              name="query"
              placeholder="Search"
              onChange={(val) => {
                updateQuery(val);
              }}
              ref={searchRef}
            />
          )}
          <Button
            onClick={() => {
              navigate("/ui/all-projects/instances");
            }}
            className="p-contextual-menu__link all-projects"
            hasIcon
          >
            <Icon name="folder" light />
            <span>All projects</span>
          </Button>
          <ProjectSelectorList projects={projects} onMount={onChildMount} />
          <hr className="is-dark" />
          <Button
            onClick={() => {
              navigate("/ui/projects/create");
            }}
            className="p-contextual-menu__link"
            hasIcon
            disabled={!canCreateProjects()}
            title={
              canCreateProjects()
                ? ""
                : "You do not have permission to create projects"
            }
          >
            <Icon name="plus" light />
            <span>Create project</span>
          </Button>
        </div>
      </ContextualMenu>
    </>
  );
};

export default ProjectSelector;
