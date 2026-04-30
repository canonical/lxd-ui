import type { FC } from "react";
import { useRef } from "react";
import {
  Button,
  ContextualMenu,
  Icon,
  SearchBox,
} from "@canonical/react-components";
import { useNavigate, useLocation } from "react-router-dom";
import { useCurrentProject } from "context/useCurrentProject";
import { useProjects } from "context/useProjects";
import NavigationProjectSelectorList from "pages/projects/NavigationProjectSelectorList";
import { useServerEntitlements } from "util/entitlements/server";
import { defaultFirst } from "util/helpers";
import { isGlobalPage, ALL_PROJECTS } from "util/projects";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  activeProject: string;
}

const NavigationProjectSelector: FC<Props> = ({
  activeProject,
}): React.JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const { canCreateProjects } = useServerEntitlements();
  const { setProjectName } = useCurrentProject();
  const isOnGlobalPage = isGlobalPage(location.pathname);

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
        {(close: () => void) => (
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
                if (isOnGlobalPage) {
                  setProjectName(ALL_PROJECTS);
                } else {
                  navigate(`${ROOT_PATH}/ui/all-projects/instances`);
                }
                close();
              }}
              className="p-contextual-menu__link all-projects"
              hasIcon
            >
              <Icon name="folder" light />
              <span>All projects</span>
            </Button>
            <NavigationProjectSelectorList
              projects={projects}
              onMount={onChildMount}
              onClose={close}
            />
            <hr className="is-dark" />
            <Button
              onClick={() => {
                navigate(`${ROOT_PATH}/ui/projects/create`);
                close();
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
        )}
      </ContextualMenu>
    </>
  );
};

export default NavigationProjectSelector;
