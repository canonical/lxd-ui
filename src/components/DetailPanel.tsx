import React, { FC, ReactNode, useEffect } from "react";
import { Button, Icon } from "@canonical/react-components";
import classnames from "classnames";
import Aside from "./Aside";
import Loader from "./Loader";
import usePanelParams from "util/usePanelParams";
import useEventListener from "@use-it/event-listener";
import { updateMaxHeight } from "util/updateMaxHeight";

interface Props {
  title: string;
  hasLoadingError: boolean;
  className: string;
  isLoading: boolean;
  actions?: ReactNode;
  children: ReactNode;
}

const DetailPanel: FC<Props> = ({
  title,
  hasLoadingError,
  className,
  isLoading,
  actions,
  children,
}) => {
  const panelParams = usePanelParams();

  const updateContentHeight = () => {
    updateMaxHeight("content-scroll");
  };
  useEffect(updateContentHeight, []);
  useEventListener("resize", updateContentHeight);

  return (
    <Aside width="narrow" pinned className="u-hide--medium u-hide--small">
      {isLoading && <Loader />}
      {!isLoading && hasLoadingError && <>Loading failed</>}
      {!hasLoadingError && (
        <div className={classnames("p-panel", "detail-panel", className)}>
          <div className="p-panel__header">
            <h2 className="p-panel__title">{title}</h2>
            <div className="p-panel__controls">
              <Button
                appearance="base"
                className="u-no-margin--bottom"
                hasIcon
                onClick={panelParams.clear}
                aria-label="Close"
              >
                <Icon name="close" />
              </Button>
            </div>
          </div>
          <div className="p-panel__content panel-content">
            {actions}
            <div className="content-scroll">{children}</div>
          </div>
        </div>
      )}
    </Aside>
  );
};

export default DetailPanel;
