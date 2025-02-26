import type { FC, PropsWithChildren } from "react";
import classnames from "classnames";

interface Props {
  isVisible: boolean;
  className?: string;
}

const Tag: FC<PropsWithChildren<Props>> = ({
  isVisible,
  children,
  className,
}) => {
  return isVisible ? (
    <span className={classnames("tag", className)}>{children}</span>
  ) : null;
};

export default Tag;
