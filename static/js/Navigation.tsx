import React, { FC, useState } from "react";
import { NavLink } from "react-router-dom";
import { Icon } from "@canonical/react-components";

const Navigation: FC = () => {
  const [menuCollapsed, setMenuCollapsed] = useState(true);

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
            <NavLink className="p-panel__logo" to="/">
              <img
                src="/static/img/logo/containers.png"
                alt="LXD-UI logo"
                className="p-panel__logo-image"
              />
            </NavLink>
            <div className="p-panel__controls">
              <button
                className="p-panel__toggle p-button--neutral is-dense"
                onClick={toggleMenu}
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      </div>
      <header className={generateMenuClass()}>
        <div className="l-navigation__drawer">
          <div className="p-panel is-dark">
            <div className="p-panel__header is-sticky">
              <NavLink className="p-panel__logo" to="/">
                <img
                  src="/static/img/logo/containers.png"
                  alt="LXD-UI logo"
                  className="p-panel__logo-image"
                />
              </NavLink>
              <div className="p-panel__controls u-hide--large">
                <button
                  className="p-button--base has-icon u-no-margin u-hide--medium"
                  onClick={toggleMenu}
                >
                  <Icon name="close" />
                </button>
              </div>
            </div>
            <div className="p-panel__content">
              <div className="p-side-navigation--icons is-dark">
                <nav aria-label="Main navigation">
                  <ul className="p-side-navigation__list">
                    <li className="p-side-navigation__item--title">
                      <NavLink
                        className="p-side-navigation__link"
                        to="/instances"
                        onClick={toggleMenu}
                      >
                        <i className="p-icon--containers is-light p-side-navigation__icon"></i>{" "}
                        Instances
                      </NavLink>
                    </li>
                    <li className="p-side-navigation__item--title">
                      <NavLink
                        className="p-side-navigation__link"
                        to="/images"
                        onClick={toggleMenu}
                      >
                        <i className="p-icon--applications is-light p-side-navigation__icon"></i>{" "}
                        Images
                      </NavLink>
                    </li>
                    <li className="p-side-navigation__item--title">
                      <NavLink
                        className="p-side-navigation__link"
                        to="/networks"
                        onClick={toggleMenu}
                      >
                        <i className="p-icon--connected is-light p-side-navigation__icon"></i>{" "}
                        Networks
                      </NavLink>
                    </li>
                    <li className="p-side-navigation__item--title">
                      <NavLink
                        className="p-side-navigation__link"
                        to="/projects"
                        onClick={toggleMenu}
                      >
                        <i className="p-icon--switcher-environments is-light p-side-navigation__icon"></i>{" "}
                        Projects
                      </NavLink>
                    </li>
                    <li className="p-side-navigation__item--title">
                      <NavLink
                        className="p-side-navigation__link"
                        to="/warnings"
                        onClick={toggleMenu}
                      >
                        <i className="p-icon--warning-grey is-light p-side-navigation__icon"></i>{" "}
                        Warnings
                      </NavLink>
                    </li>
                  </ul>
                  <ul className="p-side-navigation__list">
                    <li className="p-side-navigation__item--title">
                      <a
                        className="p-side-navigation__link"
                        href="https://linuxcontainers.org/lxd/docs/master/"
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
                        href="https://github.com/lxc/lxd/issues/new"
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
