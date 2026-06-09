import type { FC, ReactNode } from "react";
import { CustomSelect } from "@canonical/react-components";
import type { LxdLoadBalancerPool } from "types/loadBalancers";

interface Props {
  id: string;
  name: string;
  help?: ReactNode;
  value: string;
  setValue: (value: string) => void;
  availablePools: LxdLoadBalancerPool[];
  error?: string;
}

const LoadBalancerPoolSelector: FC<Props> = ({
  id,
  name,
  help,
  value,
  setValue,
  availablePools,
  error,
}) => {
  return (
    <CustomSelect
      id={id}
      name={name}
      help={help}
      required
      searchable="never"
      value={value}
      error={error}
      disabled={availablePools.length === 0}
      onChange={setValue}
      defaultToggleLabel={
        availablePools.length > 0
          ? "Select a load balancer pool"
          : "No load balancer pool available"
      }
      dropdownClassName="load-balancer-pool-dropdown"
      header={
        <div className="header">
          <span className="name">Name</span>
          <span className="instances u-align--right">Instances</span>
          <span className="port u-align--right">Target port</span>
        </div>
      }
      options={availablePools.map((pool) => {
        return {
          label: (
            <div className="label">
              <span className="name u-truncate" title={pool.name}>
                {pool.name}
              </span>
              <span className="instances u-text--muted u-align--right">
                {pool.instances.length}
              </span>
              <span className="port u-text--muted u-align--right">
                {pool.config.target_port}
              </span>
            </div>
          ),
          text: pool.name,
          value: pool.name,
        };
      })}
    />
  );
};

export default LoadBalancerPoolSelector;
