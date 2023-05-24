import React, { FC, MouseEvent, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button, Icon } from "@canonical/react-components";
import { useAuth } from "context/auth";
import classnames from "classnames";
import Logo from "./Logo";
import ProjectSelector from "pages/projects/ProjectSelector";
import { getProjectFromUrl } from "util/projects";
import ServerVersion from "components/ServerVersion";
import useEventListener from "@use-it/event-listener";
import { isWidthBelow } from "util/helpers";

const isSmallScreen = () => isWidthBelow(620);

const Navigation: FC = () => {
  const location = useLocation();
  const [menuCollapsed, setMenuCollapsed] = useState(isSmallScreen());
  const project = getProjectFromUrl(location.pathname) ?? "default";

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

  const collapseOnMediumScreen = () => {
    setMenuCollapsed(isWidthBelow(820));
  };

  useEventListener("resize", collapseOnMediumScreen);

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
                          activeProject={project}
                        />
                      </li>
                      <li className="p-side-navigation__item secondary">
                        <NavLink
                          className="p-side-navigation__link"
                          to={`/ui/${project}/instances`}
                          title={`Instances (${project})`}
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
                          className="p-side-navigation__link"
                          to={`/ui/${project}/profiles`}
                          title={`Profiles (${project})`}
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
                          className="p-side-navigation__link"
                          to={`/ui/${project}/networks`}
                          title={`Networks (${project})`}
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
                          className="p-side-navigation__link"
                          to={`/ui/${project}/storage`}
                          title={`Storage pools (${project})`}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="pods"
                          />{" "}
                          Storage pools
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item secondary">
                        <NavLink
                          className="p-side-navigation__link"
                          to={`/ui/${project}/operations`}
                          title={`Operations (${project})`}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="status"
                          />{" "}
                          Operations
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item secondary">
                        <NavLink
                          className="p-side-navigation__link"
                          to={`/ui/${project}/configuration`}
                          title={`Configuration (${project})`}
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
                        <NavLink
                          className="p-side-navigation__link"
                          to="/ui/cluster"
                          title="Cluster"
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="machines"
                          />{" "}
                          Cluster
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item">
                        <NavLink
                          className="p-side-navigation__link"
                          to="/ui/warnings"
                          title="Warnings"
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="warning-grey"
                          />{" "}
                          Warnings
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item">
                        <NavLink
                          className="p-side-navigation__link"
                          to="/ui/settings"
                          title="Settings"
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="settings"
                          />{" "}
                          Settings
                        </NavLink>
                      </li>
                    </>
                  )}
                  {!isAuthenticated && (
                    <>
                      <li className="p-side-navigation__item">
                        <NavLink
                          className="p-side-navigation__link"
                          to="/ui/certificates/generate"
                          title="Authentication"
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="security"
                          />{" "}
                          Authentication
                        </NavLink>
                      </li>
                    </>
                  )}
                </ul>
                <ul className="p-side-navigation__list sidenav-bottom-ul">
                  <li className="p-side-navigation__item">
                    <a
                      className="p-side-navigation__link"
                      href="https://linuxcontainers.org/lxd/docs/latest/"
                      target="_blank"
                      rel="noreferrer"
                      title="Documentation"
                    >
                      <Icon
                        className="is-light p-side-navigation__icon"
                        name="information"
                      />{" "}
                      Documentation
                    </a>
                  </li>
                  <li className="p-side-navigation__item">
                    <a
                      className="p-side-navigation__link"
                      href="https://discuss.linuxcontainers.org/"
                      target="_blank"
                      rel="noreferrer"
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
                      rel="noreferrer"
                      title="Report a bug"
                    >
                      <Icon
                        className="is-light p-side-navigation__icon"
                        name="code"
                      />{" "}
                      Report a bug
                    </a>
                  </li>
                  <ServerVersion />
                </ul>
              </div>
            </div>
            <div className="sidenav-toggle-wrapper">
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
