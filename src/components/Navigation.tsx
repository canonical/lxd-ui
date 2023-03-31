import React, { FC, MouseEvent, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button, Icon } from "@canonical/react-components";
import { useAuth } from "context/auth";
import classnames from "classnames";
import Logo from "./Logo";
import ProjectSelector from "pages/projects/ProjectSelector";
import { getProjectFromUrl } from "util/projects";

const isSmallScreen = () => {
  // using the max from both, because there is a bug in chrome, causing a 0 outerWidth for
  // background tabs: https://bugs.chromium.org/p/chromium/issues/detail?id=719296
  return Math.max(window.outerWidth, window.innerWidth) < 620;
};

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
                      <li className="p-side-navigation__item--title secondary">
                        <NavLink
                          className="p-side-navigation__link"
                          to={`/ui/${project}/instances`}
                          title={`Instances (${project})`}
                        >
                          <i className="p-icon--containers is-light p-side-navigation__icon"></i>{" "}
                          Instances
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item--title secondary">
                        <NavLink
                          className="p-side-navigation__link"
                          to={`/ui/${project}/profiles`}
                          title={`Profiles (${project})`}
                        >
                          <i className="p-icon--profile is-light p-side-navigation__icon"></i>{" "}
                          Profiles
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item--title secondary">
                        <NavLink
                          className="p-side-navigation__link"
                          to={`/ui/${project}/networks`}
                          title={`Networks (${project})`}
                        >
                          <i className="p-icon--connected is-light p-side-navigation__icon"></i>{" "}
                          Networks
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item--title secondary">
                        <NavLink
                          className="p-side-navigation__link"
                          to={`/ui/${project}/storages`}
                          title={`Storages (${project})`}
                        >
                          <i className="p-icon--pods is-light p-side-navigation__icon"></i>{" "}
                          Storages
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item--title secondary">
                        <NavLink
                          className="p-side-navigation__link"
                          to={`/ui/${project}/configuration`}
                          title={`Configuration (${project})`}
                        >
                          <i className="p-icon--switcher-environments is-light p-side-navigation__icon"></i>{" "}
                          Configuration
                        </NavLink>
                      </li>
                      <hr className="is-dark navigation-hr" />
                      <li className="p-side-navigation__item--title">
                        <NavLink
                          className="p-side-navigation__link"
                          to="/ui/cluster"
                          title="Cluster"
                        >
                          <i className="p-icon--machines is-light p-side-navigation__icon"></i>{" "}
                          Cluster
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item--title">
                        <NavLink
                          className="p-side-navigation__link"
                          to="/ui/warnings"
                          title="Warnings"
                        >
                          <i className="p-icon--warning-grey is-light p-side-navigation__icon"></i>{" "}
                          Warnings
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item--title">
                        <NavLink
                          className="p-side-navigation__link"
                          to="/ui/settings"
                          title="Settings"
                        >
                          <i className="p-icon--settings is-light p-side-navigation__icon"></i>{" "}
                          Settings
                        </NavLink>
                      </li>
                    </>
                  )}
                  {!isAuthenticated && (
                    <>
                      <li className="p-side-navigation__item--title">
                        <NavLink
                          className="p-side-navigation__link"
                          to="/ui/certificates/generate"
                          title="Authentication"
                        >
                          <i className="p-icon--security is-light p-side-navigation__icon"></i>{" "}
                          Authentication
                        </NavLink>
                      </li>
                    </>
                  )}
                </ul>
                <ul className="p-side-navigation__list sidenav-bottom-ul">
                  <li className="p-side-navigation__item--title">
                    <a
                      className="p-side-navigation__link"
                      href="https://linuxcontainers.org/lxd/docs/latest/"
                      target="_blank"
                      rel="noreferrer"
                      title="Documentation"
                    >
                      <i className="p-icon--information is-light p-side-navigation__icon"></i>{" "}
                      Documentation
                    </a>
                  </li>
                  <li className="p-side-navigation__item--title">
                    <a
                      className="p-side-navigation__link"
                      href="https://discuss.linuxcontainers.org/"
                      target="_blank"
                      rel="noreferrer"
                      title="Discussion"
                    >
                      <i className="p-icon--share is-light p-side-navigation__icon"></i>{" "}
                      Discussion
                    </a>
                  </li>
                  <li className="p-side-navigation__item--title">
                    <a
                      className="p-side-navigation__link"
                      href="https://github.com/canonical/lxd-ui/issues/new"
                      target="_blank"
                      rel="noreferrer"
                      title="Report a bug"
                    >
                      <i className="p-icon--code is-light p-side-navigation__icon"></i>{" "}
                      Report a bug
                    </a>
                  </li>
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
