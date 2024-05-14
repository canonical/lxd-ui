import { FC, PropsWithChildren, ReactNode } from "react";
import classnames from "classnames";
import { AppAside, Panel, Spinner } from "@canonical/react-components";
import { createPortal } from "react-dom";
import usePanelParams from "util/usePanelParams";
import useEventListener from "@use-it/event-listener";

interface CommonProps {
  className?: string;
}

// Header components
const HeaderControls: FC<PropsWithChildren & CommonProps> = ({
  children,
  className,
}) => {
  return (
    <div className={classnames("p-panel__controls", className)}>{children}</div>
  );
};

const HeaderTitle: FC<PropsWithChildren & CommonProps> = ({
  children,
  className,
}) => {
  return (
    <h2 className={classnames("p-panel__title", className)}>{children}</h2>
  );
};

const Sticky: FC<PropsWithChildren & CommonProps> = ({
  children,
  className,
}) => {
  return (
    <div className={classnames("sticky-wrapper", className)}>{children}</div>
  );
};

const Header: FC<PropsWithChildren & CommonProps> = ({
  children,
  className,
}) => {
  return (
    <div className={classnames("p-panel__header", className)}>{children}</div>
  );
};

// Panel content components
const Container: FC<PropsWithChildren & CommonProps> = ({
  children,
  className,
}) => {
  return <Panel className={className}>{children}</Panel>;
};

const Content: FC<PropsWithChildren & CommonProps> = ({
  children,
  className,
}) => {
  return (
    <div className={classnames("p-panel__content", className)}>{children}</div>
  );
};

// Footer components
const Footer: FC<PropsWithChildren & CommonProps> = ({
  children,
  className,
}) => {
  return (
    <div className={classnames("panel-footer", className)} id="panel-footer">
      <hr />
      {children}
    </div>
  );
};

interface SidePanelProps {
  isOverlay?: boolean;
  isSplit?: boolean;
  children: ReactNode;
  loading: boolean;
  hasError: boolean;
  className?: string;
  width?: "narrow" | "wide";
  pinned?: boolean;
}

const SidePanelComponent: FC<SidePanelProps> = ({
  children,
  isOverlay,
  isSplit = false,
  loading = false,
  hasError,
  className,
  width,
  pinned,
}) => {
  const panelParams = usePanelParams();

  useEventListener("keydown", (e: KeyboardEvent) => {
    // Close panel if Escape key is pressed
    if (e.code === "Escape") panelParams.clear();
  });

  return createPortal(
    <AppAside
      className={classnames(className, {
        "is-narrow": width === "narrow",
        "is-wide": width === "wide",
        "is-split": isSplit,
        "is-overlay": isOverlay,
      })}
      aria-label="Side panel"
      pinned={pinned}
    >
      {loading ? (
        <div className="loading">
          <Spinner />
        </div>
      ) : (
        <>{hasError ? <>Loading failed</> : children}</>
      )}
    </AppAside>,
    document.getElementById("l-application") as Element,
  );
};

type SidePanelComponents = FC<SidePanelProps> & {
  Header: FC<PropsWithChildren & CommonProps>;
  HeaderTitle: FC<PropsWithChildren & CommonProps>;
  HeaderControls: FC<PropsWithChildren & CommonProps>;
  Sticky: FC<PropsWithChildren & CommonProps>;
  Container: FC<PropsWithChildren & CommonProps>;
  Content: FC<PropsWithChildren & CommonProps>;
  Footer: FC<PropsWithChildren & CommonProps>;
};

const SidePanel = SidePanelComponent as SidePanelComponents;
SidePanel.Header = Header;
SidePanel.HeaderTitle = HeaderTitle;
SidePanel.HeaderControls = HeaderControls;
SidePanel.Sticky = Sticky;
SidePanel.Container = Container;
SidePanel.Content = Content;
SidePanel.Footer = Footer;

export default SidePanel;
