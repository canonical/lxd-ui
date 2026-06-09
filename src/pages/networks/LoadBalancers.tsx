import type { FC } from "react";
import type { LxdNetwork } from "types/network";
import { useCurrentProject } from "context/useCurrentProject";
import MenuItem from "components/forms/FormMenuItem";
import { useNavigate, useParams } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";
import LoadBalancersTab from "pages/networks/LoadBalancersTab";
import LoadBalancerPoolsTab from "pages/networks/LoadBalancerPoolsTab";
import usePanelParams, { panels } from "util/usePanelParams";
import CreateLoadBalancerPoolPanel from "pages/networks/panels/CreateLoadBalancerPoolPanel";
import EditLoadBalancerPoolPanel from "pages/networks/panels/EditLoadBalancerPoolPanel";

interface Props {
  network: LxdNetwork;
}

const LoadBalancers: FC<Props> = ({ network }) => {
  const { projectName: project } = useCurrentProject();
  const { section } = useParams<{
    section?: string;
  }>();
  const navigate = useNavigate();
  const panelParams = usePanelParams();

  return (
    <>
      <div className="load-balancers">
        <div className="p-side-navigation--accordion form-navigation">
          <nav aria-label="Load balancer navigation">
            <ul className="p-side-navigation__list">
              <MenuItem
                label="Load balancers"
                active={section ?? "load-balancers"}
                setActive={() => {
                  navigate(
                    `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}/load-balancers`,
                  );
                }}
              />
              <MenuItem
                label="Pools"
                active={section ?? ""}
                setActive={() => {
                  navigate(
                    `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}/load-balancers/pools`,
                  );
                }}
              />
            </ul>
          </nav>
        </div>
        {section !== "pools" && <LoadBalancersTab network={network} />}
        {section === "pools" && <LoadBalancerPoolsTab network={network} />}
      </div>

      {panelParams.panel === panels.createLoadBalancerPool && (
        <CreateLoadBalancerPoolPanel network={network} />
      )}

      {panelParams.panel === panels.editLoadBalancerPool && (
        <EditLoadBalancerPoolPanel network={network} />
      )}
    </>
  );
};

export default LoadBalancers;
