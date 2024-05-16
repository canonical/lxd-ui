import { FC, MouseEvent, PropsWithChildren, useState } from "react";
import { ApplicationLayout } from "@canonical/react-components";
import classnames from "classnames";
import Logo from "./Logo";
import { isWidthBelow } from "util/helpers";
import { useMenuCollapsed } from "context/menuCollapsed";
import NavLink from "components/NavLink";
import Navigation from "./Navigation";

const isSmallScreen = () => isWidthBelow(620);

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const { menuCollapsed, setMenuCollapsed } = useMenuCollapsed();
  const [scroll] = useState(false);

  const softToggleMenu = () => {
    if (isSmallScreen()) {
      setMenuCollapsed((prev) => !prev);
    }
  };

  const hardToggleMenu = (e?: MouseEvent<HTMLElement>) => {
    setMenuCollapsed((prev) => !prev);
    e?.stopPropagation();
  };

  return (
    <ApplicationLayout
      id="l-application"
      logo={<Logo />}
      sideNavigation={
        <Navigation
          menuCollapsed={menuCollapsed}
          hardToggleMenu={hardToggleMenu}
          setMenuCollapsed={setMenuCollapsed}
          softToggleMenu={softToggleMenu}
        />
      }
      onCollapseMenu={() => hardToggleMenu()}
      onPinMenu={() => hardToggleMenu()}
      menuCollapsed={menuCollapsed}
      menuPinned={!menuCollapsed}
      navLinkComponent={NavLink}
      navigationClassName={classnames({
        "is-scroll": scroll,
      })}
    >
      {children}
    </ApplicationLayout>
  );
};

export default Layout;
