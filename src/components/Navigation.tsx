import { FC, MouseEvent, useEffect, useState } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useAuth } from "context/auth";
import classnames from "classnames";
import Logo from "./Logo";
import ProjectSelector from "pages/projects/ProjectSelector";
import { getElementAbsoluteHeight, isWidthBelow, logout } from "util/helpers";
import { useProject } from "context/project";
import { useMenuCollapsed } from "context/menuCollapsed";
import { useDocs } from "context/useDocs";
import NavLink from "components/NavLink";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import NavAccordion, { AccordionNavMenu } from "./NavAccordion";
import useEventListener from "@use-it/event-listener";
import { enablePermissionsFeature } from "util/permissions";
import { Location, useLocation } from "react-router-dom";
import { useLoggedInUser } from "context/useLoggedInUser";

const isSmallScreen = () => isWidthBelow(620);

const initialiseOpenNavMenus = (location: Location) => {
  const openPermissions = location.pathname.includes("permissions");
  const openStorage = location.pathname.includes("storage");
  const initialOpenMenus: AccordionNavMenu[] = [];
  if (openPermissions) {
    initialOpenMenus.push("permissions");
  }

  if (openStorage) {
    initialOpenMenus.push("storage");
  }

  return initialOpenMenus;
};

const Navigation: FC = () => {
  const { isRestricted, isOidc } = useAuth();
  const docBaseLink = useDocs();
  const { menuCollapsed, setMenuCollapsed } = useMenuCollapsed();
  const { project, isLoading } = useProject();
  const [projectName, setProjectName] = useState(
    project && !isLoading ? project.name : "default",
  );
  const { hasCustomVolumeIso } = useSupportedFeatures();
  const { loggedInUserName, loggedInUserID, authMethod } = useLoggedInUser();
  const enablePermissions = enablePermissionsFeature();
  const [scroll, setScroll] = useState(false);
  const location = useLocation();
  const [openNavMenus, setOpenNavMenus] = useState<AccordionNavMenu[]>(() =>
    initialiseOpenNavMenus(location),
  );

  useEffect(() => {
    project && project.name !== projectName && setProjectName(project.name);
  }, [project?.name]);

  useEffect(() => {
    if (!menuCollapsed) {
      adjustNavigationScrollForOverflow();
      return;
    }

    if (scroll && !menuCollapsed) {
      setScroll(false);
    }

    if (openNavMenus.length) {
      setOpenNavMenus([]);
    }
  }, [menuCollapsed, scroll, openNavMenus]);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    adjustNavigationScrollForOverflow();
  }, [openNavMenus, isAuthenticated]);

  const softToggleMenu = () => {
    if (isSmallScreen()) {
      setMenuCollapsed((prev) => !prev);
    }
  };

  const hardToggleMenu = (e: MouseEvent<HTMLElement>) => {
    setMenuCollapsed((prev) => !prev);
    e.stopPropagation();
  };

  const adjustNavigationScrollForOverflow = () => {
    const navHeader = document.querySelector(".l-navigation .p-panel__header");
    const navTop = document.querySelector(".l-navigation .p-panel__content");
    const navBottom = document.querySelector(
      ".l-navigation .sidenav-bottom-container",
    );
    const navHeaderHeight = getElementAbsoluteHeight(navHeader as HTMLElement);
    const navTopHeight = getElementAbsoluteHeight(navTop as HTMLElement);
    const navBottomHeight = getElementAbsoluteHeight(navBottom as HTMLElement);

    const totalNavHeight = navHeaderHeight + navTopHeight + navBottomHeight;

    const isNavigationPanelOverflow = totalNavHeight >= window.innerHeight;

    const targetNavTopHeight =
      window.innerHeight - navHeaderHeight - navBottomHeight;

    if (isNavigationPanelOverflow) {
      const style = `height: ${targetNavTopHeight}px`;
      navTop?.setAttribute("style", style);
      setScroll(true);
    } else {
      const style = `height: auto`;
      navTop?.setAttribute("style", style);
      setScroll(false);
    }
  };

  const toggleAccordionNav = (feature: AccordionNavMenu) => {
    if (menuCollapsed) {
      setMenuCollapsed(false);
    }

    const newOpenMenus = openNavMenus.includes(feature)
      ? openNavMenus.filter((navMenu) => navMenu !== feature)
      : [...openNavMenus, feature];

    setOpenNavMenus(newOpenMenus);
  };

  useEventListener("resize", adjustNavigationScrollForOverflow);

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
          "is-scroll": scroll,
        })}
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
              <div className="p-side-navigation--icons is-dark sidenav-top-container">
                <ul className="p-side-navigation__list sidenav-top-ul">
                  {isAuthenticated && (
                    <>
                      <li onClick={(e) => e.stopPropagation()}>
                        <ProjectSelector
                          key={location.pathname}
                          activeProject={projectName}
                        />
                      </li>
                      <li className="p-side-navigation__item">
                        <NavLink
                          to={`/ui/project/${projectName}/instances`}
                          title={`Instances (${projectName})`}
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="containers"
                          />{" "}
                          Instances
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item">
                        <NavLink
                          to={`/ui/project/${projectName}/profiles`}
                          title={`Profiles (${projectName})`}
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="units"
                          />{" "}
                          Profiles
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item">
                        <NavLink
                          to={`/ui/project/${projectName}/networks`}
                          title={`Networks (${projectName})`}
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="connected"
                          />{" "}
                          Networks
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item">
                        <NavAccordion
                          baseUrl={`/ui/project/${projectName}/storage`}
                          title={`Storage (${projectName})`}
                          iconName="pods"
                          label="Storage"
                          onOpen={() => toggleAccordionNav("storage")}
                          open={openNavMenus.includes("storage")}
                        >
                          {[
                            <li
                              className="p-side-navigation__item"
                              key={`/ui/project/${projectName}/storage/pools`}
                            >
                              <NavLink
                                to={`/ui/project/${projectName}/storage/pools`}
                                title="Pools"
                                onClick={softToggleMenu}
                                className="accordion-nav-secondary"
                              >
                                Pools
                              </NavLink>
                            </li>,
                            <li
                              className="p-side-navigation__item"
                              key={`/ui/project/${projectName}/storage/volumes`}
                            >
                              <NavLink
                                to={`/ui/project/${projectName}/storage/volumes`}
                                title="Volumes"
                                onClick={softToggleMenu}
                                className="accordion-nav-secondary"
                              >
                                Volumes
                              </NavLink>
                            </li>,
                            ...(hasCustomVolumeIso
                              ? [
                                  <li
                                    className="p-side-navigation__item"
                                    key={`/ui/project/${projectName}/storage/custom-isos`}
                                  >
                                    <NavLink
                                      to={`/ui/project/${projectName}/storage/custom-isos`}
                                      title="Custom ISOs"
                                      onClick={softToggleMenu}
                                      className="accordion-nav-secondary"
                                    >
                                      Custom ISOs
                                    </NavLink>
                                  </li>,
                                ]
                              : []),
                          ]}
                        </NavAccordion>
                      </li>
                      <li className="p-side-navigation__item">
                        <NavLink
                          to={`/ui/project/${projectName}/images`}
                          title={`Images (${projectName})`}
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="applications"
                          />{" "}
                          Images
                        </NavLink>
                      </li>
                      <li className="p-side-navigation__item">
                        <NavLink
                          to={`/ui/project/${projectName}/configuration`}
                          title={`Configuration (${projectName})`}
                          onClick={softToggleMenu}
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
                          to="/ui/cluster"
                          title="Cluster"
                          onClick={softToggleMenu}
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
                          to={`/ui/operations`}
                          title={`Operations (${projectName})`}
                          onClick={softToggleMenu}
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
                          <NavLink
                            to="/ui/warnings"
                            title="Warnings"
                            onClick={softToggleMenu}
                          >
                            <Icon
                              className="is-light p-side-navigation__icon"
                              name="warning-grey"
                            />{" "}
                            Warnings
                          </NavLink>
                        </li>
                      )}
                      {enablePermissions && (
                        <li className="p-side-navigation__item">
                          <NavAccordion
                            baseUrl="/ui/permissions"
                            title={`Permissions`}
                            iconName="user"
                            label="Permissions"
                            onOpen={() => toggleAccordionNav("permissions")}
                            open={openNavMenus.includes("permissions")}
                          >
                            {[
                              <li
                                className="p-side-navigation__item"
                                key="/ui/permissions/identities"
                              >
                                <NavLink
                                  to="/ui/permissions/identities"
                                  title="Identities"
                                  onClick={softToggleMenu}
                                  activeUrlMatches={["permissions/identity"]}
                                  className="accordion-nav-secondary"
                                >
                                  Identities
                                </NavLink>
                              </li>,
                              <li
                                className="p-side-navigation__item"
                                key="/ui/permissions/groups"
                              >
                                <NavLink
                                  to="/ui/permissions/groups"
                                  title="LXD groups"
                                  onClick={softToggleMenu}
                                  className="accordion-nav-secondary"
                                >
                                  Groups
                                </NavLink>
                              </li>,
                              <li
                                className="p-side-navigation__item"
                                key="/ui/permissions/idp-groups"
                              >
                                <NavLink
                                  to="/ui/permissions/idp-groups"
                                  title="Identity provider groups"
                                  onClick={softToggleMenu}
                                  className="accordion-nav-secondary"
                                >
                                  IDP groups
                                </NavLink>
                              </li>,
                            ]}
                          </NavAccordion>
                        </li>
                      )}
                      <li className="p-side-navigation__item">
                        <NavLink
                          to="/ui/settings"
                          title="Settings"
                          onClick={softToggleMenu}
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
                          to="/ui/login"
                          title="Login"
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="profile"
                          />
                          Login
                        </NavLink>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              <div className="p-side-navigation--icons is-dark sidenav-bottom-container">
                <ul
                  className={classnames(
                    "p-side-navigation__list sidenav-bottom-ul",
                    {
                      "authenticated-nav": isAuthenticated,
                    },
                  )}
                >
                  <hr className="is-dark navigation-hr" />
                  {isAuthenticated && (
                    <li className="p-side-navigation__item">
                      <div
                        className="p-side-navigation__link"
                        title={`${loggedInUserName} (${loggedInUserID})`}
                      >
                        {authMethod == "tls" ? (
                          <Icon
                            className="p-side-navigation__icon is-dark"
                            name="lock-locked"
                          />
                        ) : authMethod == "oidc" ? (
                          <Icon
                            className="p-side-navigation__icon is-dark"
                            name="profile"
                          />
                        ) : (
                          <></>
                        )}
                        <div className="u-truncate">{loggedInUserName}</div>
                      </div>
                    </li>
                  )}
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
                        name="information"
                      />
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
                      />
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
                      />
                      Report a bug
                    </a>
                  </li>
                  {isOidc && (
                    <li className="p-side-navigation__item">
                      <a
                        className="p-side-navigation__link"
                        title="Log out"
                        onClick={() => {
                          logout();
                          softToggleMenu();
                        }}
                      >
                        <Icon
                          className="is-light p-side-navigation__icon p-side-logout"
                          name="export"
                        />
                        Log out
                      </a>
                    </li>
                  )}
                </ul>
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
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
