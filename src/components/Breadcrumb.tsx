import type { FC, ReactNode } from "react";
import classnames from "classnames";

interface Props {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  trailingContent?: ReactNode;
}

const Breadcrumb: FC<Props> = ({
  children,
  ariaLabel = "Breadcrumbs",
  className,
  trailingContent,
}) => {
  return (
    <nav
      className={classnames("p-breadcrumbs p-breadcrumbs--large", className)}
      aria-label={ariaLabel}
    >
      <ol className="p-breadcrumbs__items breadcrumb-wrapper">{children}</ol>
      {trailingContent}
    </nav>
  );
};

export default Breadcrumb;
