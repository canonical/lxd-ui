import type { FC, ReactNode } from "react";

interface Props {
  title: ReactNode;
  children: ReactNode;
}

const LoadBalancerTableHeading: FC<Props> = ({ title, children }) => {
  return (
    <div className="load-balancer-table-heading">
      <div className="left">
        <h2 className="p-heading--4">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default LoadBalancerTableHeading;
