import React, { FC, useState } from "react";
import { NavLink } from "react-router-dom";
import { Button, Icon } from "@canonical/react-components";
import { useAuth } from "../context/auth";

const Navigation: FC = () => {
  const [menuCollapsed, setMenuCollapsed] = useState(true);
  const project = "default";

  const { isAuthenticated } = useAuth();
  const toggleMenu = () => setMenuCollapsed(!menuCollapsed);

  const generateMenuClass = () => {
    let generatedClass = "l-navigation";
    if (menuCollapsed) {
      generatedClass += " is-collapsed";
    }
    return generatedClass;
  };

  return (
    <>
      <div className="l-navigation-bar">
        <div className="p-panel is-dark">
          <div className="p-panel__header">
            <NavLink className="p-panel__logo" to="/ui/">
              <img
                src="/ui/static/assets/img/logo/containers.svg"
                alt="LXD-UI logo"
                className="p-panel__logo-image"
              />
            </NavLink>
            <div className="p-panel__controls">
              <Button dense className="p-panel__toggle" onClick={toggleMenu}>
                Menu
              </Button>
            </div>
          </div>
        </div>
      </div>
      <header className={generateMenuClass()}>
        <div className="l-navigation__drawer">
          <div className="p-panel is-dark">
            <div className="p-panel__header is-sticky">
              <NavLink className="p-panel__logo" to="/ui/">
                <img
                  src="/ui/static/assets/img/logo/containers.svg"
                  alt="LXD-UI logo"
                  className="p-panel__logo-image"
                />
              </NavLink>
              <div className="p-panel__controls u-hide--large">
                <Button
                  appearance="base"
                  hasIcon
                  className="u-no-margin u-hide--medium"
                  onClick={toggleMenu}
                >
                  <Icon name="close" />
                </Button>
              </div>
            </div>
            <div className="p-panel__content">
              <div className="p-side-navigation--icons is-dark">
                <nav aria-label="Main navigation">
                  {isAuthenticated && (
                    <ul className="p-side-navigation__list">
                      <li className="p-side-navigation__item--title">
                        <NavLink
                          className="p-side-navigation__link"
                          to={`/ui/${project}/instances`}
                          onClick={toggleMenu}
                        >
                          <i className="p-icon--containers is-light p-side-navigation__icon"></i>{" "}
                          Instances
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item--title">
                        <NavLink
                          className="p-side-navigation__link"
                          to={`/ui/${project}/profiles`}
                          onClick={toggleMenu}
                        >
                          <i className="p-icon--profile is-light p-side-navigation__icon"></i>{" "}
                          Profiles
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item--title">
                        <NavLink
                          className="p-side-navigation__link"
                          to={`/ui/${project}/networks`}
                          onClick={toggleMenu}
                        >
                          <i className="p-icon--connected is-light p-side-navigation__icon"></i>{" "}
                          Networks
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item--title">
                        <NavLink
                          className="p-side-navigation__link"
                          to="/ui/projects"
                          onClick={toggleMenu}
                        >
                          <i className="p-icon--switcher-environments is-light p-side-navigation__icon"></i>{" "}
                          Projects
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item--title">
                        <NavLink
                          className="p-side-navigation__link"
                          to={`/ui/${project}/storages`}
                          onClick={toggleMenu}
                        >
                          <i className="p-icon--pods is-light p-side-navigation__icon"></i>{" "}
                          Storages
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item--title">
                        <NavLink
                          className="p-side-navigation__link"
                          to="/ui/cluster"
                          onClick={toggleMenu}
                        >
                          <i className="p-icon--machines is-light p-side-navigation__icon"></i>{" "}
                          Cluster
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item--title">
                        <NavLink
                          className="p-side-navigation__link"
                          to="/ui/warnings"
                          onClick={toggleMenu}
                        >
                          <i className="p-icon--warning-grey is-light p-side-navigation__icon"></i>{" "}
                          Warnings
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item--title">
                        <NavLink
                          className="p-side-navigation__link"
                          to="/ui/settings"
                          onClick={toggleMenu}
                        >
                          <i className="p-icon--settings is-light p-side-navigation__icon"></i>{" "}
                          Settings
                        </NavLink>
                      </li>
                    </ul>
                  )}
                  <ul className="p-side-navigation__list">
                    <li className="p-side-navigation__item--title">
                      <a
                        className="p-side-navigation__link"
                        href="https://linuxcontainers.org/lxd/docs/latest/"
                        target="_blank"
                        rel="noreferrer"
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
                      >
                        <i className="p-icon--code is-light p-side-navigation__icon"></i>{" "}
                        Report a bug
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navigation;
