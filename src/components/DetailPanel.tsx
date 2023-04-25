import React, { FC, ReactNode } from "react";
import { Button, Icon } from "@canonical/react-components";
import { LxdInstance } from "types/instance";
import { LxdProfile } from "types/profile";
import classnames from "classnames";
import Aside from "./Aside";
import Loader from "./Loader";
import usePanelParams from "util/usePanelParams";

interface Props {
  entityName: string;
  entity?: LxdInstance | LxdProfile;
  className: string;
  isLoading: boolean;
  stickyChildren?: ReactNode;
  children: ReactNode;
}

const DetailPanel: FC<Props> = ({
  entityName,
  entity,
  className,
  isLoading,
  stickyChildren,
  children,
}) => {
  const panelParams = usePanelParams();

  const title = `${entityName[0].toUpperCase() + entityName.slice(1)} summary`;

  return (
    <Aside width="narrow" pinned className="u-hide--medium u-hide--small">
      {isLoading && <Loader />}
      {!isLoading && !entity && <>Loading {entityName} failed</>}
      {entity && (
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
            {stickyChildren}
            <div className="content-scroll">{children}</div>
          </div>
        </div>
      )}
    </Aside>
  );
};

export default DetailPanel;
