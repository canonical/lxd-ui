import type { FC, ReactNode } from "react";
import classnames from "classnames";

interface Props {
  title: string;
  subtitle?: ReactNode;
  footerLink: ReactNode;
  centered?: boolean;
  classname?: string;
}

const CardEmptyState: FC<Props> = ({
  title,
  subtitle,
  footerLink,
  centered = !subtitle,
  classname = "overview-empty-state",
}) => {
  return (
    <>
      <div
        className={classnames(classname, "u-no-margin--bottom", {
          "is-centered": centered,
        })}
      >
        <p className="overview-card-subtitle u-no-margin--bottom">{title}</p>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {footerLink && <div className="card-footer">{footerLink}</div>}
    </>
  );
};

export default CardEmptyState;
