import type { FC, ReactNode } from "react";
import { Icon } from "@canonical/react-components";

interface Props {
  children?: ReactNode;
  title?: string;
  titleIcon?: string;
}

const DashboardCard: FC<Props> = ({ children, title, titleIcon }) => {
  if (!children) {
    return null;
  }

  return (
    <div className="dashboard-card">
      {title && (
        <div className="dashboard-card-title">
          {titleIcon && <Icon name={titleIcon} />}
          <b>{title}</b>
        </div>
      )}
      {children}
    </div>
  );
};

export default DashboardCard;
