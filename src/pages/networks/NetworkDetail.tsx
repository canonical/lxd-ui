import type { FC } from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  typesWithForwards,
  typesWithLeases,
  typesWithLocalPeerings,
} from "util/networks";
import NetworkPeers from "./NetworkPeers";
import { slugify } from "util/slugify";
import classnames from "classnames";
import NotFound from "components/NotFound";

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
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      notify.failure("Loading network failed", error);
    }
  }, [error]);

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  const isManagedNetwork = network?.managed ?? false;
  const hasForwards =
    typesWithForwards.includes(network?.type ?? "") && isManagedNetwork;
  const hasLeases =
    typesWithLeases.includes(network?.type ?? "") && isManagedNetwork;
  const isPeeringSupported = typesWithLocalPeerings.includes(
    network?.type ?? "",
  );

  const networkUrl = `/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(name)}`;

  const getTabClassnames = (isDisabled: boolean) => {
    return classnames("p-tabs__link", {
      "is-disabled": isDisabled,
    });
  };

  const getTabLink = (label: string, supported: boolean, path: string) => {
    const slug = slugify(label);
    const url = supported ? `${networkUrl}/${path}` : "#";

    return {
      href: url,
      className: getTabClassnames(!supported),
      title: supported ? label : `${label} are not supported on this network`,
      id: slug,
      label,
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        notify.clear();
        navigate(url);
      },
      active: slug === activeTab,
    };
  };

  const tabs = [
    "Configuration",
    getTabLink("Forwards", hasForwards, "forwards"),
    getTabLink("Leases", hasLeases, "leases"),
    getTabLink("Local peerings", isPeeringSupported, "local-peerings"),
  ];

  return (
    <CustomLayout
      header={
        <NetworkDetailHeader network={network} project={project} name={name} />
      }
      contentClassName="edit-network"
    >
      {!isLoading && !network && (
        <NotFound
          entityType="network"
          entityName={name}
          errorMessage={error?.message}
        />
      )}
      {!isLoading && network && (
        <Row>
          <TabLinks tabs={tabs} activeTab={activeTab} tabUrl={networkUrl} />
          <NotificationRow />
          {!activeTab && (
            <div role="tabpanel" aria-labelledby="configuration">
              {network && <EditNetwork network={network} project={project} />}
            </div>
          )}
          {activeTab === "forwards" && (
            <div role="tabpanel" aria-labelledby="forwards">
              {network && (
                <NetworkForwards network={network} project={project} />
              )}
            </div>
          )}
          {activeTab === "leases" && (
            <div role="tabpanel" aria-labelledby="leases">
              {network && <NetworkLeases network={network} project={project} />}
            </div>
          )}
          {activeTab === "local-peerings" && (
            <div role="tabpanel" aria-labelledby="local-peerings">
              {network && <NetworkPeers network={network} project={project} />}
            </div>
          )}
        </Row>
      )}
    </CustomLayout>
  );
};

export default NetworkDetail;
