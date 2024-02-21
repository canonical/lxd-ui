import { FC, useRef } from "react";
import {
  Button,
  ContextualMenu,
  Icon,
  SearchBox,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchProjects } from "api/projects";
import { useNavigate } from "react-router-dom";
import ProjectSelectorList from "pages/projects/ProjectSelectorList";
import { defaultFirst } from "util/helpers";

interface Props {
  activeProject: string;
}

const ProjectSelector: FC<Props> = ({ activeProject }): JSX.Element => {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: projects = [] } = useQuery({
    queryKey: [queryKeys.projects],
    queryFn: fetchProjects,
  });

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
              onChange={(val) => updateQuery(val)}
              ref={searchRef}
            />
          )}
          <ProjectSelectorList projects={projects} onMount={onChildMount} />
          <hr className="is-dark" />
          <Button
            onClick={() => navigate("/ui/projects/create")}
            className="p-contextual-menu__link"
            hasIcon
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
