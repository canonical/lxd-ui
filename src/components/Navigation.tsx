import { FC, MouseEvent, useEffect, useState } from "react";
import {
  Button,
  Icon,
  SideNavigation,
  SideNavigationItem,
  SideNavigationLink,
} from "@canonical/react-components";
import { useAuth } from "context/auth";
import classnames from "classnames";
import ProjectSelector from "pages/projects/ProjectSelector";
import { getElementAbsoluteHeight, logout } from "util/helpers";
import { useProject } from "context/project";
import { useDocs } from "context/useDocs";
import NavLink from "components/NavLink";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import NavAccordion, { AccordionNavMenu } from "./NavAccordion";
import useEventListener from "@use-it/event-listener";
import { enablePermissionsFeature } from "util/permissions";
import { Location, NavLinkProps, useLocation } from "react-router-dom";

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

type Props = {
  hardToggleMenu: () => void;
  menuCollapsed: boolean;
  setMenuCollapsed: (menuCollapsed: boolean) => void;
  softToggleMenu: () => void;
};

const Navigation: FC<Props> = ({
  menuCollapsed,
  hardToggleMenu,
  setMenuCollapsed,
  softToggleMenu,
}) => {
  const { isRestricted, isOidc } = useAuth();
  const docBaseLink = useDocs();
  const { project, isLoading } = useProject();
  const [projectName, setProjectName] = useState(
    project && !isLoading ? project.name : "default",
  );
  const { hasCustomVolumeIso } = useSupportedFeatures();
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

  const adjustNavigationScrollForOverflow = () => {
    const navHeader = document.querySelector(".l-navigation .p-panel__header");
    const navContent = document.querySelector(
      ".l-navigation .p-panel__content",
    );
    const navFooter = document.querySelector(
      ".l-navigation .sidenav-bottom-ul",
    );
    const navToggle = document.querySelector(
      ".l-navigation .sidenav-toggle-wrapper",
    );
    const navHeaderHeight = getElementAbsoluteHeight(navHeader as HTMLElement);
    const navContentHeight = getElementAbsoluteHeight(
      navContent as HTMLElement,
    );
    const navFooterHeight = getElementAbsoluteHeight(navFooter as HTMLElement);
    const navToggleHeight = getElementAbsoluteHeight(navToggle as HTMLElement);

    let totalNavHeight = navHeaderHeight + navContentHeight + navFooterHeight;

    // when the continer is in scrolling mode, p-panel__content includes the footer height already since it's not absolutely positioned
    // also need to take into account the toggle height
    if (scroll) {
      const footerOffset = navToggleHeight - navFooterHeight;
      totalNavHeight = totalNavHeight + footerOffset;
    }

    const isNavigationPanelOverflow = totalNavHeight >= window.innerHeight;

    if (isNavigationPanelOverflow) {
      setScroll(true);
    } else {
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
      <SideNavigation<NavLinkProps>
        dark
        items={[
          {
            className: "sidenav-top-ul",
            items: isAuthenticated
              ? [
                  {
                    children: (
                      <ProjectSelector
                        key={location.pathname}
                        activeProject={projectName}
                      />
                    ),
                    onClick: (e: MouseEvent) => e.stopPropagation(),
                  },
                  {
                    icon: "containers",
                    label: "Instances",
                    onClick: softToggleMenu,
                    title: `Instances (${projectName})`,
                    to: `/ui/project/${projectName}/instances`,
                  },
                  {
                    icon: "units",
                    label: "Profiles",
                    onClick: softToggleMenu,
                    title: `Profiles (${projectName})`,
                    to: `/ui/project/${projectName}/profiles`,
                  },
                  {
                    icon: "connected",
                    label: "Networks",
                    onClick: softToggleMenu,
                    title: `Networks (${projectName})`,
                    to: `/ui/project/${projectName}/networks`,
                  },
                  {
                    icon: "connected",
                    label: "Networks",
                    onClick: softToggleMenu,
                    title: `Networks (${projectName})`,
                    to: `/ui/project/${projectName}/networks`,
                  },
                  <NavAccordion
                    baseUrl={`/ui/project/${projectName}/storage`}
                    title={`Storage (${projectName})`}
                    iconName="pods"
                    key="storage"
                    label="Storage"
                    onOpen={() => toggleAccordionNav("storage")}
                    open={openNavMenus.includes("storage")}
                  >
                    {[
                      <SideNavigationItem
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
                      </SideNavigationItem>,
                      <SideNavigationItem
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
                      </SideNavigationItem>,
                      ...(hasCustomVolumeIso
                        ? [
                            <SideNavigationItem
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
                            </SideNavigationItem>,
                          ]
                        : []),
                    ]}
                  </NavAccordion>,
                  {
                    icon: "applications",
                    label: "Images",
                    onClick: softToggleMenu,
                    title: `Images (${projectName})`,
                    to: `/ui/project/${projectName}/images`,
                  },
                  {
                    icon: "switcher-environments",
                    label: "Configuration",
                    onClick: softToggleMenu,
                    title: `Configuration (${projectName})`,
                    to: `/ui/project/${projectName}/configuration`,
                  },
                  <hr className="is-dark navigation-hr" key="hr" />,
                  {
                    icon: "machines",
                    label: "Cluster",
                    onClick: softToggleMenu,
                    title: "Cluster",
                    to: "/ui/cluster",
                  },
                  {
                    icon: "status",
                    label: "Operations",
                    onClick: softToggleMenu,
                    title: `Operations (${projectName})`,
                    to: "/ui/operations",
                  },
                  isRestricted
                    ? null
                    : {
                        icon: "warning-grey",
                        label: "Warnings",
                        onClick: softToggleMenu,
                        title: "Warnings",
                        to: "/ui/warnings",
                      },
                  enablePermissions ? (
                    <NavAccordion
                      baseUrl="/ui/permissions"
                      title={`Permissions`}
                      iconName="user"
                      key="permissions"
                      label="Permissions"
                      onOpen={() => toggleAccordionNav("permissions")}
                      open={openNavMenus.includes("permissions")}
                    >
                      {[
                        <SideNavigationItem key="/ui/permissions/identities">
                          <NavLink
                            to="/ui/permissions/identities"
                            title="Identities"
                            onClick={softToggleMenu}
                            activeUrlMatches={["permissions/identity"]}
                            className="accordion-nav-secondary"
                          >
                            Identities
                          </NavLink>
                        </SideNavigationItem>,
                        <SideNavigationItem key="/ui/permissions/groups">
                          <NavLink
                            to="/ui/permissions/groups"
                            title="LXD groups"
                            onClick={softToggleMenu}
                            className="accordion-nav-secondary"
                          >
                            Groups
                          </NavLink>
                        </SideNavigationItem>,
                        <SideNavigationItem key="/ui/permissions/idp-groups">
                          <NavLink
                            to="/ui/permissions/idp-groups"
                            title="Identity provider groups"
                            onClick={softToggleMenu}
                            className="accordion-nav-secondary"
                          >
                            IDP groups
                          </NavLink>
                        </SideNavigationItem>,
                      ]}
                    </NavAccordion>
                  ) : null,
                  {
                    icon: "settings",
                    label: "Settings",
                    onClick: softToggleMenu,
                    title: "Settings",
                    to: "/ui/settings",
                  },
                  isOidc ? (
                    <SideNavigationLink
                      icon="power-off"
                      label="Log out"
                      onClick={() => {
                        logout();
                        softToggleMenu();
                      }}
                      title="Log out"
                    />
                  ) : null,
                ]
              : [
                  {
                    icon: "profile",
                    label: "Login",
                    onClick: softToggleMenu,
                    title: "Login",
                    to: "/ui/login",
                  },
                ],
          },
          {
            className: classnames("sidenav-bottom-ul", {
              "authenticated-nav": isAuthenticated,
            }),
            items: [
              <SideNavigationLink
                href={docBaseLink}
                icon="information"
                key="docs"
                label="Documentation"
                rel="noopener noreferrer"
                target="_blank"
                title="Documentation"
              />,
              <SideNavigationLink
                href="https://discourse.ubuntu.com/c/lxd/126"
                icon="share"
                key="discussion"
                label="Discussion"
                rel="noopener noreferrer"
                target="_blank"
                title="Discussion"
              />,
              <SideNavigationLink
                href="https://github.com/canonical/lxd-ui/issues/new"
                icon="code"
                key="bug"
                label="Report a bug"
                rel="noopener noreferrer"
                target="_blank"
                title="Report a bug"
              />,
            ],
          },
        ]}
        linkComponent={NavLink}
      />
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
    </>
  );
};

export default Navigation;
