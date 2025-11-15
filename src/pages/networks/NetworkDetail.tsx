import type { FC } from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import EditNetwork from "pages/networks/EditNetwork";
import NetworkDetailHeader from "pages/networks/NetworkDetailHeader";
import {
  Row,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import TabLinks from "components/TabLinks";
import NetworkForwards from "pages/networks/NetworkForwards";
import { useNetwork } from "context/useNetworks";
import NetworkLeases from "pages/networks/NetworkLeases";
import { ovnType, typesWithForwards, typesWithLeases } from "util/networks";
import NetworkPeers from "./NetworkPeers";
import { slugify } from "util/slugify";
import classnames from "classnames";

const NetworkDetail: FC = () => {
  const notify = useNotify();

  const { name, project, member, activeTab } = useParams<{
    name: string;
    project: string;
    member: string;
    activeTab?: string;
  }>();

  if (!name) {
    return <>Missing name</>;
  }

  if (!project) {
    return <>Missing project</>;
  }

  const { data: network, error, isLoading } = useNetwork(name, project, member);

  useEffect(() => {
    if (error) {
      notify.failure("Loading network failed", error);
    }
  }, [error]);

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  const isManagedNetwork = network?.managed;
  const hasForwards =
    typesWithForwards.includes(network?.type ?? "") && isManagedNetwork;
  const hasLeases = typesWithLeases.includes(network?.type ?? "");
  const isPeeringSupported = network?.type === ovnType;

  const tabLink = `/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(name)}`;

  const getTabClassnames = (isDisabled: boolean) => {
    return classnames("p-tabs__link", {
      "is-disabled": isDisabled,
    });
  };

  return (
    <CustomLayout
      header={
        <NetworkDetailHeader network={network} project={project} name={name} />
      }
      contentClassName="edit-network"
    >
      <Row>
        <TabLinks
          tabs={[
            "Configuration",
            {
              component: () => {
                return (
                  <Link
                    to={hasForwards ? `${tabLink}/forwards` : "#"}
                    className={getTabClassnames(!hasForwards)}
                    title={
                      hasForwards
                        ? "Forwards"
                        : `Forwards are not supported on this network`
                    }
                  >
                    Forwards
                  </Link>
                );
              },
              id: "forwards",
              label: "Forwards",
              active: slugify("Forwards") === activeTab,
            },
            {
              component: () => {
                return (
                  <Link
                    to={hasLeases ? `${tabLink}/leases` : "#"}
                    className={getTabClassnames(!hasLeases)}
                    title={
                      hasLeases
                        ? "Leases"
                        : `Leases are not supported on this network`
                    }
                  >
                    Leases
                  </Link>
                );
              },
              id: "leases",
              label: "Leases",
              active: slugify("Leases") === activeTab,
            },
            {
              component: () => {
                return (
                  <Link
                    to={isPeeringSupported ? `${tabLink}/local-peering` : "#"}
                    className={getTabClassnames(!isPeeringSupported)}
                    title={
                      isPeeringSupported
                        ? "Local Peering"
                        : `Local Peering is not supported on this network`
                    }
                  >
                    Local Peering
                  </Link>
                );
              },
              id: "local-peering",
              label: "Local Peering",
              active: slugify("Local Peering") === activeTab,
            },
          ]}
          activeTab={activeTab}
          tabUrl={tabLink}
        />
        <NotificationRow />
        {!activeTab && (
          <div role="tabpanel" aria-labelledby="configuration">
            {network && <EditNetwork network={network} project={project} />}
          </div>
        )}
        {activeTab === "forwards" && (
          <div role="tabpanel" aria-labelledby="forwards">
            {network && <NetworkForwards network={network} project={project} />}
          </div>
        )}
        {activeTab === "leases" && (
          <div role="tabpanel" aria-labelledby="leases">
            {network && <NetworkLeases network={network} project={project} />}
          </div>
        )}
        {activeTab === "local-peering" && (
          <div role="tabpanel" aria-labelledby="local-peering">
            {network && <NetworkPeers network={network} project={project} />}
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkDetail;
