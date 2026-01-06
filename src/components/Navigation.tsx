import type { FC, MouseEvent } from "react";
import { useEffect, useState } from "react";
import {
  Button,
  Icon,
  isDarkTheme,
  loadTheme,
  SideNavigationItem,
  Step,
  Stepper,
  useListener,
} from "@canonical/react-components";
import { useAuth } from "context/auth";
import classnames from "classnames";
import Logo from "./Logo";
import NavigationProjectSelector from "pages/projects/NavigationProjectSelector";
import {
  capitalizeFirstLetter,
  getElementAbsoluteHeight,
  logout,
} from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import { useCurrentProject } from "context/useCurrentProject";
import { useMenuCollapsed } from "context/menuCollapsed";
import NavLink from "components/NavLink";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import type { AccordionNavMenu } from "./NavAccordion";
import NavAccordion from "./NavAccordion";
import type { Location } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useLoggedInUser } from "context/useLoggedInUser";
import { useSettings } from "context/useSettings";
import type { LxdProject } from "types/project";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useIsClustered } from "context/useIsClustered";
import { getReportBugURL } from "util/reportBug";
import DocLink from "components/DocLink";

const initialiseOpenNavMenus = (location: Location) => {
  const openPermissions = location.pathname.includes("/permissions/");
  const openStorage = location.pathname.includes("/storage/");
  const openNetwork = location.pathname.includes("/network");
  const openCluster =
    location.pathname.includes("/cluster/") ||
    location.pathname.includes("/placement-groups");
  const initialOpenMenus: AccordionNavMenu[] = [];
  if (openPermissions) {
    initialOpenMenus.push("permissions");
  }

  if (openStorage) {
    initialOpenMenus.push("storage");
  }

  if (openNetwork) {
    initialOpenMenus.push("networking");
  }

  if (openCluster) {
    initialOpenMenus.push("clustering");
  }

  return initialOpenMenus;
};

const ALL_PROJECTS = "All projects";

const initializeProjectName = (
  isAllProjectsFromUrl: boolean,
  isLoading: boolean,
  project: LxdProject | undefined,
) => {
  if (isAllProjectsFromUrl) {
    return ALL_PROJECTS;
  }

  if (project && !isLoading) {
    return project.name;
  }

  return "default";
};

const Navigation: FC = () => {
  const { isRestricted, isOidc, isAuthenticated } = useAuth();
  const { menuCollapsed, setMenuCollapsed } = useMenuCollapsed();
  const {
    project,
    isAllProjects: isAllProjectsFromUrl,
    canViewProject,
    isLoading,
  } = useCurrentProject();

  const isSmallScreen = useIsScreenBelow();
  const [projectName, setProjectName] = useState(
    initializeProjectName(isAllProjectsFromUrl, isLoading, project),
  );
  const isAllProjects = projectName === ALL_PROJECTS;
  const { hasCustomVolumeIso, hasAccessManagement } = useSupportedFeatures();
  const { loggedInUserName, loggedInUserID, authMethod } = useLoggedInUser();
  const [scroll, setScroll] = useState(false);
  const location = useLocation();
  const [openNavMenus, setOpenNavMenus] = useState<AccordionNavMenu[]>(() =>
    initialiseOpenNavMenus(location),
  );

  const onGenerate = location.pathname.includes("certificate-generate");
  const onTrustToken = location.pathname.includes("certificate-add");
  const { data: settings } = useSettings();
  const hasOidc = settings?.auth_methods?.includes("oidc");
  const hasCertificate = settings?.client_certificate;
  const navigate = useNavigate();
  const isClustered = useIsClustered();

  useEffect(() => {
    const isAllProjects = isAllProjectsFromUrl || !canViewProject;
    if (isAllProjects && projectName !== ALL_PROJECTS) {
      setProjectName(ALL_PROJECTS);
      setOpenNavMenus([]);
      return;
    }

    if (project && project.name !== projectName) {
      setProjectName(project.name);
    }
  }, [project?.name, isAllProjectsFromUrl, projectName]);

  useEffect(() => {
    if (!menuCollapsed) {
      adjustNavigationScrollForOverflow();
      return;
    }

    if (scroll && !menuCollapsed) {
      setScroll(false);
    }
  }, [menuCollapsed, scroll, openNavMenus]);

  useEffect(() => {
    adjustNavigationScrollForOverflow();
  }, [
    openNavMenus,
    isAuthenticated,
    loggedInUserID,
    loggedInUserName,
    authMethod,
  ]);

  const softToggleMenu = () => {
    if (isSmallScreen) {
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

  useListener(window, adjustNavigationScrollForOverflow, "resize", true);

  const getNavTitle = (title: string) => {
    if (isAllProjects) {
      return `Select a project to explore ${title}`;
    }

    return `${capitalizeFirstLetter(title)} (${projectName})`;
  };

  const isDark = isAuthenticated || isDarkTheme(loadTheme());
  const isLight = !isDark;

  return (
    <>
      <header className="l-navigation-bar">
        <div
          className={classnames("p-panel", {
            "is-light": isLight,
            "is-dark": isDark,
          })}
        >
          <div className="p-panel__header">
            <Logo light={isLight} />
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
          <div
            className={classnames("p-panel", {
              "is-light": isLight,
              "is-dark": isDark,
            })}
          >
            <div className="p-panel__header is-sticky">
              <Logo light={isLight} />
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
              <div
                className={classnames(
                  "p-side-navigation--icons sidenav-top-container",
                  { "is-light": isLight },
                )}
              >
                <ul className="p-side-navigation__list sidenav-top-ul">
                  {isAuthenticated && (
                    <>
                      <li
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <NavigationProjectSelector
                          key={location.pathname}
                          activeProject={projectName}
                        />
                      </li>
                      <SideNavigationItem>
                        <NavLink
                          to={
                            isAllProjects
                              ? `${ROOT_PATH}/ui/all-projects/instances`
                              : `${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/instances`
                          }
                          title={`Instances (${projectName})`}
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="pods"
                          />{" "}
                          Instances
                        </NavLink>
                      </SideNavigationItem>
                      <SideNavigationItem>
                        <NavLink
                          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/profiles`}
                          title={getNavTitle("profiles")}
                          disabled={isAllProjects}
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="repository"
                          />{" "}
                          Profiles
                        </NavLink>
                      </SideNavigationItem>

                      <SideNavigationItem>
                        <NavAccordion
                          baseUrl={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/network`}
                          title={getNavTitle("networking")}
                          disabled={isAllProjects}
                          iconName="exposed"
                          label="Networking"
                          onOpen={() => {
                            toggleAccordionNav("networking");
                          }}
                          open={openNavMenus.includes("networking")}
                        >
                          {[
                            <SideNavigationItem
                              key={`/ui/project/${encodeURIComponent(projectName)}/networks`}
                            >
                              <NavLink
                                to={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/networks`}
                                title={`Networks (${projectName})`}
                                onClick={softToggleMenu}
                                className="accordion-nav-secondary"
                                ignoreUrlMatches={[
                                  "network-acl",
                                  "network-acls",
                                  "network-ipam",
                                ]}
                              >
                                Networks
                              </NavLink>
                            </SideNavigationItem>,
                            <SideNavigationItem
                              key={`/ui/project/${encodeURIComponent(projectName)}/network-acls`}
                            >
                              <NavLink
                                to={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/network-acls`}
                                title={`ACLs (${projectName})`}
                                onClick={softToggleMenu}
                                className="accordion-nav-secondary"
                              >
                                ACLs
                              </NavLink>
                            </SideNavigationItem>,
                            <SideNavigationItem
                              key={`/ui/project/${encodeURIComponent(projectName)}/network-ipam`}
                            >
                              <NavLink
                                to={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/network-ipam`}
                                title={`IPAM (${projectName})`}
                                onClick={softToggleMenu}
                                className="accordion-nav-secondary"
                              >
                                IPAM
                              </NavLink>
                            </SideNavigationItem>,
                          ]}
                        </NavAccordion>
                      </SideNavigationItem>
                      <SideNavigationItem>
                        <NavAccordion
                          baseUrl={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/storage`}
                          title={getNavTitle("storage")}
                          disabled={isAllProjects}
                          iconName="switcher-dashboard"
                          label="Storage"
                          onOpen={() => {
                            toggleAccordionNav("storage");
                          }}
                          open={openNavMenus.includes("storage")}
                        >
                          {[
                            <SideNavigationItem
                              key={`/ui/project/${encodeURIComponent(projectName)}/storage/pools`}
                            >
                              <NavLink
                                to={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/storage/pools`}
                                title="Pools"
                                onClick={softToggleMenu}
                                className="accordion-nav-secondary"
                                ignoreUrlMatches={[
                                  "volumes/custom",
                                  "/bucket/",
                                ]}
                              >
                                Pools
                              </NavLink>
                            </SideNavigationItem>,
                            <SideNavigationItem
                              key={`/ui/project/${encodeURIComponent(projectName)}/storage/volumes`}
                            >
                              <NavLink
                                to={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/storage/volumes`}
                                title="Volumes"
                                onClick={softToggleMenu}
                                className="accordion-nav-secondary"
                                activeUrlMatches={["volumes/custom"]}
                              >
                                Volumes
                              </NavLink>
                            </SideNavigationItem>,
                            ...(hasCustomVolumeIso
                              ? [
                                  <SideNavigationItem
                                    key={`/ui/project/${encodeURIComponent(projectName)}/storage/custom-isos`}
                                  >
                                    <NavLink
                                      to={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/storage/custom-isos`}
                                      title="Custom ISOs"
                                      onClick={softToggleMenu}
                                      className="accordion-nav-secondary"
                                    >
                                      Custom ISOs
                                    </NavLink>
                                  </SideNavigationItem>,
                                ]
                              : []),
                            <SideNavigationItem
                              key={`/ui/project/${encodeURIComponent(projectName)}/storage/buckets`}
                            >
                              <NavLink
                                to={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/storage/buckets`}
                                title="Buckets"
                                onClick={softToggleMenu}
                                className="accordion-nav-secondary"
                                activeUrlMatches={["/bucket/"]}
                              >
                                Buckets
                              </NavLink>
                            </SideNavigationItem>,
                          ]}
                        </NavAccordion>
                      </SideNavigationItem>
                      <SideNavigationItem>
                        <NavLink
                          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/images`}
                          title={getNavTitle("images")}
                          disabled={isAllProjects}
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="image"
                          />{" "}
                          Images
                        </NavLink>
                      </SideNavigationItem>
                      <SideNavigationItem>
                        <NavLink
                          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/configuration`}
                          title={getNavTitle("configuration")}
                          disabled={isAllProjects}
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="switcher-environments"
                          />{" "}
                          Configuration
                        </NavLink>
                      </SideNavigationItem>
                      <hr
                        className={classnames("navigation-hr", {
                          "is-light": isLight,
                        })}
                      />
                      {isClustered && (
                        <SideNavigationItem>
                          <NavAccordion
                            baseUrl={`${ROOT_PATH}/ui/cluster`}
                            title={getNavTitle("clustering")}
                            iconName="cluster-host"
                            label="Clustering"
                            onOpen={() => {
                              toggleAccordionNav("clustering");
                            }}
                            open={openNavMenus.includes("clustering")}
                          >
                            {[
                              <SideNavigationItem key="members">
                                <NavLink
                                  to={`${ROOT_PATH}/ui/cluster/members`}
                                  title="Members"
                                  onClick={softToggleMenu}
                                  className="accordion-nav-secondary"
                                >
                                  Members
                                </NavLink>
                              </SideNavigationItem>,
                              <SideNavigationItem key="groups">
                                <NavLink
                                  to={`${ROOT_PATH}/ui/cluster/groups`}
                                  title="Groups"
                                  onClick={softToggleMenu}
                                  className="accordion-nav-secondary"
                                >
                                  Groups
                                </NavLink>
                              </SideNavigationItem>,
                              <SideNavigationItem key="placement">
                                <NavLink
                                  to={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/placement-groups`}
                                  title={`Placement groups (${projectName})`}
                                  onClick={softToggleMenu}
                                  className="accordion-nav-secondary"
                                >
                                  Placement
                                </NavLink>
                              </SideNavigationItem>,
                            ]}
                          </NavAccordion>
                        </SideNavigationItem>
                      )}
                      {!isClustered && (
                        <SideNavigationItem>
                          <NavLink
                            to={`${ROOT_PATH}/ui/server`}
                            title="Server"
                            onClick={softToggleMenu}
                          >
                            <Icon
                              className="is-light p-side-navigation__icon"
                              name="cluster-host"
                            />{" "}
                            Server
                          </NavLink>
                        </SideNavigationItem>
                      )}
                      <SideNavigationItem>
                        <NavLink
                          to={`${ROOT_PATH}/ui/operations`}
                          title={`Operations (${projectName})`}
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="status"
                          />{" "}
                          Operations
                        </NavLink>
                      </SideNavigationItem>
                      {!isRestricted && (
                        <SideNavigationItem>
                          <NavLink
                            to={`${ROOT_PATH}/ui/warnings?status=new`}
                            title="Warnings"
                            onClick={softToggleMenu}
                          >
                            <Icon
                              className="is-light p-side-navigation__icon"
                              name="warning-grey"
                            />{" "}
                            Warnings
                          </NavLink>
                        </SideNavigationItem>
                      )}
                      {hasAccessManagement && (
                        <SideNavigationItem>
                          <NavAccordion
                            baseUrl={`${ROOT_PATH}/ui/permissions`}
                            title={`Permissions`}
                            iconName="user"
                            label="Permissions"
                            onOpen={() => {
                              toggleAccordionNav("permissions");
                            }}
                            open={openNavMenus.includes("permissions")}
                          >
                            {[
                              <SideNavigationItem key="/ui/permissions/identities">
                                <NavLink
                                  to={`${ROOT_PATH}/ui/permissions/identities?system-identities=hide`}
                                  title="Identities"
                                  onClick={softToggleMenu}
                                  activeUrlMatches={[
                                    `${ROOT_PATH}/ui/permissions/identities`,
                                  ]}
                                  className="accordion-nav-secondary"
                                >
                                  Identities
                                </NavLink>
                              </SideNavigationItem>,
                              <SideNavigationItem key="/ui/permissions/groups">
                                <NavLink
                                  to={`${ROOT_PATH}/ui/permissions/groups`}
                                  title="Groups"
                                  onClick={softToggleMenu}
                                  className="accordion-nav-secondary"
                                >
                                  Groups
                                </NavLink>
                              </SideNavigationItem>,
                              <SideNavigationItem key="/ui/permissions/idp-groups">
                                <NavLink
                                  to={`${ROOT_PATH}/ui/permissions/idp-groups`}
                                  title="Identity provider groups"
                                  onClick={softToggleMenu}
                                  className="accordion-nav-secondary"
                                >
                                  IDP groups
                                </NavLink>
                              </SideNavigationItem>,
                            ]}
                          </NavAccordion>
                        </SideNavigationItem>
                      )}
                      <SideNavigationItem>
                        <NavLink
                          to={`${ROOT_PATH}/ui/settings`}
                          title="Settings"
                          onClick={softToggleMenu}
                        >
                          <Icon
                            className="is-light p-side-navigation__icon"
                            name="settings"
                          />{" "}
                          Settings
                        </NavLink>
                      </SideNavigationItem>
                    </>
                  )}
                  {!isAuthenticated && (onGenerate || onTrustToken) && (
                    <div
                      className={classnames("login-navigation", {
                        "is-collapsed": menuCollapsed,
                      })}
                    >
                      {hasOidc && !menuCollapsed && (
                        <a
                          className="p-button has-icon sso-login-button"
                          href={`${ROOT_PATH}/oidc/login`}
                        >
                          <Icon name="security" />
                          <span>Login with SSO instead</span>
                        </a>
                      )}
                      <Stepper
                        steps={[
                          <Step
                            key="Step 1"
                            handleClick={() => {
                              navigate(
                                `${ROOT_PATH}/ui/login/certificate-generate`,
                              );
                            }}
                            index={1}
                            title="Browser certificate"
                            hasProgressLine={false}
                            enabled
                            iconName="number"
                            selected={onGenerate}
                            iconClassName="stepper-icon"
                          />,
                          <Step
                            key="Step 2"
                            handleClick={() => {
                              navigate(`${ROOT_PATH}/ui/login/certificate-add`);
                            }}
                            index={2}
                            title="Identity trust token"
                            hasProgressLine={false}
                            enabled
                            iconName="number"
                            selected={onTrustToken}
                          />,
                        ]}
                      />
                    </div>
                  )}
                </ul>
              </div>
              <div
                className={classnames(
                  "p-side-navigation--icons sidenav-bottom-container",
                  { "is-light": isLight },
                )}
              >
                <ul
                  className={classnames(
                    "p-side-navigation__list sidenav-bottom-ul",
                    {
                      "authenticated-nav": isAuthenticated,
                    },
                  )}
                >
                  <hr
                    className={classnames("navigation-hr", {
                      "is-light": isLight,
                    })}
                  />
                  {isAuthenticated && (
                    <SideNavigationItem>
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
                        ) : authMethod == "unix" ? (
                          <Icon
                            className="p-side-navigation__icon is-dark"
                            name="profile"
                          />
                        ) : (
                          <></>
                        )}
                        <div className="u-truncate">{loggedInUserName}</div>
                      </div>
                    </SideNavigationItem>
                  )}
                  <SideNavigationItem>
                    <DocLink
                      className="p-side-navigation__link"
                      title="Documentation"
                      docPath="/"
                    >
                      <Icon
                        className={classnames("p-side-navigation__icon", {
                          "is-light": isAuthenticated,
                        })}
                        name="book"
                      />
                      Documentation
                    </DocLink>
                  </SideNavigationItem>
                  <SideNavigationItem>
                    <a
                      className="p-side-navigation__link"
                      href="https://discourse.ubuntu.com/c/lxd/126"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Discussion"
                    >
                      <Icon
                        className={classnames("p-side-navigation__icon", {
                          "is-light": isAuthenticated,
                        })}
                        name="share"
                      />
                      Discussion
                    </a>
                  </SideNavigationItem>
                  <SideNavigationItem>
                    <a
                      className="p-side-navigation__link"
                      href={getReportBugURL()}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Report a bug"
                    >
                      <Icon
                        className={classnames("p-side-navigation__icon", {
                          "is-light": isAuthenticated,
                        })}
                        name="submit-bug"
                      />
                      Report a bug
                    </a>
                  </SideNavigationItem>
                  {isOidc && (
                    <SideNavigationItem>
                      <a
                        className="p-side-navigation__link"
                        title="Log out"
                        onClick={() => {
                          logout(hasOidc, hasCertificate);

                          softToggleMenu();
                        }}
                      >
                        <Icon
                          className="is-light p-side-navigation__icon p-side-logout"
                          name="export"
                        />
                        Log out
                      </a>
                    </SideNavigationItem>
                  )}
                </ul>
                <div
                  className={classnames("sidenav-toggle-wrapper", {
                    "authenticated-nav": isAuthenticated,
                    "is-light": isLight,
                  })}
                >
                  <Button
                    appearance="base"
                    aria-label={`${
                      menuCollapsed ? "expand" : "collapse"
                    } main navigation`}
                    hasIcon
                    dense
                    className={classnames(
                      "sidenav-toggle u-no-margin l-navigation-collapse-toggle u-hide--small",
                      { "is-light": isLight },
                    )}
                    onClick={hardToggleMenu}
                  >
                    <Icon
                      name="sidebar-toggle"
                      className={classnames({ "is-light": isLight })}
                    />
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
