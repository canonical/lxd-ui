import type { FC, ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: ReactNode;
  footerLink?: ReactNode;
}

const CardEmptyState: FC<Props> = ({ title, subtitle, footerLink }) => {
  return (
    <>
      <div className="overview-empty-state">
        <p className="overview-card-subtitle u-no-margin--bottom">{title}</p>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {footerLink && <div className="card-footer">{footerLink}</div>}
    </>
  );
};

export default CardEmptyState;
