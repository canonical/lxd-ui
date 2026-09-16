import type { FC, ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: ReactNode;
}

const CardEmptyState: FC<Props> = ({ title, subtitle }) => {
  return (
    <>
      <div className="overview-empty-state">
        <p className="overview-card-subtitle u-no-margin--bottom">{title}</p>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </>
  );
};

export default CardEmptyState;
