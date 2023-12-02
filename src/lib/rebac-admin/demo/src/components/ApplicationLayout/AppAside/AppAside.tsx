import Button from "@canonical/react-components/dist/components/Button";
import Icon from "@canonical/react-components/dist/components/Icon";
import type { PropsWithSpread } from "@canonical/react-components/dist/types";
import classNames from "classnames";
import type { HTMLProps, PropsWithChildren, ReactNode } from "react";

import type { PanelProps } from "components/Panel";
import Panel from "components/Panel";

type Props = PropsWithSpread<
  {
    controls?: PanelProps["controls"];
    onClose?: () => void;
    pinned?: boolean;
    title?: ReactNode;
  } & PropsWithChildren,
  HTMLProps<HTMLDivElement>
>;

const AppAside = ({
  children,
  className,
  controls,
  onClose,
  pinned,
  title,
  ...props
}: Props) => {
  return (
    <aside
      className={classNames("l-aside", className, {
        "is-pinned": pinned,
      })}
      {...props}
    >
      <Panel
        controls={
          <>
            {controls}
            {onClose ? (
              <Button
                appearance="base"
                className="u-no-margin--bottom"
                hasIcon
                onClick={() => onClose()}
              >
                <Icon name="close">Close</Icon>
              </Button>
            ) : null}
          </>
        }
        title={title}
      >
        {children}
      </Panel>
    </aside>
  );
};

export default AppAside;
