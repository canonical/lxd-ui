import { FC, MouseEvent, useEffect, useState } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useAuth } from "context/auth";
import classnames from "classnames";
import Logo from "./Logo";
import ProjectSelector from "pages/projects/ProjectSelector";
import { isWidthBelow, logout } from "util/helpers";
import { useProject } from "context/project";
import { useMenuCollapsed } from "context/menuCollapsed";
import { useDocs } from "context/useDocs";
import NavLink from "components/NavLink";

const isSmallScreen = () => isWidthBelow(620);

const Navigation: FC = () => {
  const { isRestricted, isOidc } = useAuth();
  const docBaseLink = useDocs();
  const { menuCollapsed, setMenuCollapsed } = useMenuCollapsed();
  const { project, isLoading } = useProject();
  const [projectName, setProjectName] = useState(
    project && !isLoading ? project.name : "default",
  );

  useEffect(() => {
    project && project.name !== projectName && setProjectName(project.name);
  }, [project?.name]);

  const { isAuthenticated } = useAuth();
  const softToggleMenu = () => {
    if (isSmallScreen()) {
      setMenuCollapsed((prev) => !prev);
    }
  };

  const hardToggleMenu = (e: MouseEvent<HTMLElement>) => {
    setMenuCollapsed((prev) => !prev);
    e.stopPropagation();
  };

  return (
    <>
      <header className="l-navigation-bar">
        <div className="p-panel is-dark">
          <div className="p-panel__header">
            <Logo />
            <div className="p-panel__controls">
              <Button
                dense
                className="p-panel__toggle"
                onClick={hardToggleMenu}
              >
                Menu
              </Button>
            </div>
          </div>
        </div>
      </header>
      <nav
        aria-label="main navigation"
        className={classnames("l-navigation", {
          "is-collapsed": menuCollapsed,
          "is-pinned": !menuCollapsed,
        })}
        onClick={softToggleMenu}
      >
        <div className="l-navigation__drawer">
          <div className="p-panel is-dark">
            <div className="p-panel__header is-sticky">
              <Logo />
              <div className="p-panel__controls u-hide--medium u-hide--large">
                <Button
                  appearance="base"
                  hasIcon
                  className="u-no-margin"
                  aria-label="close navigation"
                  onClick={hardToggleMenu}
                >
                  <Icon name="close" />
                </Button>
              </div>
            </div>
            <div className="p-panel__content">
              <div className="p-side-navigation--icons is-dark">
                <ul className="p-side-navigation__list sidenav-top-ul">
                  {isAuthenticated && (
                    <>
                      <li onClick={(e) => e.stopPropagation()}>
                        <ProjectSelector
                          key={location.pathname}
                          activeProject={projectName}
                        />
                      </li>
                      <li className="p-side-navigation__item secondary">
                        <NavLink
                          to={`/ui/project/${projectName}/instances`}
                          title={`Instances (${projectName})`}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="containers"
                          />{" "}
                          Instances
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item secondary">
                        <NavLink
                          to={`/ui/project/${projectName}/profiles`}
                          title={`Profiles (${projectName})`}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="units"
                          />{" "}
                          Profiles
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item secondary">
                        <NavLink
                          to={`/ui/project/${projectName}/networks`}
                          title={`Networks (${projectName})`}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="connected"
                          />{" "}
                          Networks
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item secondary">
                        <NavLink
                          to={`/ui/project/${projectName}/storage`}
                          title={`Storage (${projectName})`}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="pods"
                          />{" "}
                          Storage
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item secondary">
                        <NavLink
                          to={`/ui/project/${projectName}/images`}
                          title={`Images (${projectName})`}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="applications"
                          />{" "}
                          Images
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item secondary">
                        <NavLink
                          to={`/ui/project/${projectName}/configuration`}
                          title={`Configuration (${projectName})`}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="switcher-environments"
                          />{" "}
                          Configuration
                        </NavLink>
                      </li>
                      <hr className="is-dark navigation-hr" />
                      <li className="p-side-navigation__item">
                        <NavLink to="/ui/cluster" title="Cluster">
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="machines"
                          />{" "}
                          Cluster
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item">
                        <NavLink
                          to={`/ui/operations`}
                          title={`Operations (${projectName})`}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="status"
                          />{" "}
                          Operations
                        </NavLink>
                      </li>
                      {!isRestricted && (
                        <li className="p-side-navigation__item">
                          <NavLink to="/ui/warnings" title="Warnings">
                            <Icon
                              className="is-light p-side-navigation__icon"
                              name="warning-grey"
                            />{" "}
                            Warnings
                          </NavLink>
                        </li>
                      )}
                      <li className="p-side-navigation__item">
                        <NavLink to="/ui/settings" title="Settings">
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="settings"
                          />{" "}
                          Settings
                        </NavLink>
                      </li>
                      {isOidc && (
                        <li className="p-side-navigation__item">
                          <a
                            className="p-side-navigation__link"
                            title="Log out"
                            onClick={logout}
                          >
                            <Icon
                              className="is-light p-side-navigation__icon"
                              name="power-off"
                            />{" "}
                            Log out
                          </a>
                        </li>
                      )}
                    </>
                  )}
                  {!isAuthenticated && (
                    <>
                      <li className="p-side-navigation__item">
                        <NavLink to="/ui/login" title="Login">
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="profile"
                          />{" "}
                          Login
                        </NavLink>
                      </li>
                    </>
                  )}
                </ul>
                <ul
                  className={classnames(
                    "p-side-navigation__list sidenav-bottom-ul",
                    {
                      "authenticated-nav": isAuthenticated,
                    },
                  )}
                >
                  <li className="p-side-navigation__item">
                    <a
                      className="p-side-navigation__link"
                      href={docBaseLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Documentation"
                    >
                      <Icon
                        className="p-side-navigation__icon"
                        name="info--light"
                      />{" "}
                      Documentation
                    </a>
                  </li>
                  <li className="p-side-navigation__item">
                    <a
                      className="p-side-navigation__link"
                      href="https://discourse.ubuntu.com/c/lxd/126"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Discussion"
                    >
                      <Icon
                        className="is-light p-side-navigation__icon"
                        name="share"
                      />{" "}
                      Discussion
                    </a>
                  </li>
                  <li className="p-side-navigation__item">
                    <a
                      className="p-side-navigation__link"
                      href="https://github.com/canonical/lxd-ui/issues/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Report a bug"
                    >
                      <Icon
                        className="is-light p-side-navigation__icon"
                        name="code"
                      />{" "}
                      Report a bug
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div
              className={classnames("sidenav-toggle-wrapper", {
                "authenticated-nav": isAuthenticated,
              })}
            >
              <Button
                appearance="base"
                aria-label={`${
                  menuCollapsed ? "expand" : "collapse"
                } main navigation`}
                hasIcon
                dense
                className="sidenav-toggle is-dark u-no-margin l-navigation-collapse-toggle u-hide--small"
                onClick={hardToggleMenu}
              >
                <Icon light name="sidebar-toggle" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
