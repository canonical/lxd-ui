import type { FC } from "react";
import type { LxdNetwork } from "types/network";
import { useCurrentProject } from "context/useCurrentProject";
import MenuItem from "components/forms/FormMenuItem";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";
import LoadBalancersTab from "pages/networks/LoadBalancersTab";
import LoadBalancerPoolsTab from "pages/networks/LoadBalancerPoolsTab";
import usePanelParams, { panels } from "util/usePanelParams";
import CreateLoadBalancerPoolPanel from "pages/networks/panels/CreateLoadBalancerPoolPanel";
import EditLoadBalancerPoolPanel from "pages/networks/panels/EditLoadBalancerPoolPanel";
import { Notification } from "@canonical/react-components";
import ProjectRichChip from "pages/projects/ProjectRichChip";

interface Props {
  network: LxdNetwork;
}

const LoadBalancers: FC<Props> = ({ network }) => {
  const { projectName, project, isLoading } = useCurrentProject();
  const { section } = useParams<{
    section?: string;
  }>();
  const navigate = useNavigate();
  const panelParams = usePanelParams();

  if (
    projectName !== "default" &&
    project?.config["features.networks"] !== "true" &&
    !isLoading
  ) {
    return (
      <Notification severity="caution" title="Network isolation is disabled">
        The current project <ProjectRichChip projectName={projectName} /> has
        disabled network isolation. Please enable network isolation in{" "}
        <Link
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/configuration`}
        >
          project configuration
        </Link>{" "}
        to access load balancer features.
      </Notification>
    );
  }

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
                    `${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/network/${encodeURIComponent(network.name)}/load-balancers`,
                  );
                }}
              />
              <MenuItem
                label="Pools"
                active={section ?? ""}
                setActive={() => {
                  navigate(
                    `${ROOT_PATH}/ui/project/${encodeURIComponent(projectName)}/network/${encodeURIComponent(network.name)}/load-balancers/pools`,
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
