import type { FC } from "react";
import React, { useEffect, useState } from "react";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { slugify } from "util/slugify";
import { CONNECTIONS } from "pages/networks/forms/NetworkFormMenu";
import ResourceLink from "components/ResourceLink";
import { filterUsedByType } from "util/usedBy";
import { Button, Icon, useNotify } from "@canonical/react-components";
import classNames from "classnames";
import classnames from "classnames";
import { useParams } from "react-router-dom";
import { useNetworks } from "context/useNetworks";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  project: string;
  isServerClustered: boolean;
}

const NetworkTopology: FC<Props> = ({ formik, project, isServerClustered }) => {
  const { member } = useParams<{ member: string }>();
  const notify = useNotify();
  const [isNetworksCollapsed, setNetworksCollapsed] = useState(true);
  const [isInstancesCollapsed, setInstancesCollapsed] = useState(true);
  const network = formik.values.bareNetwork;

  if (!network) {
    return;
  }

  const hasClusteredUplinks =
    isServerClustered && ["physical", "bridge"].includes(network.type);

  const { data: networks = [], error } = useNetworks(project);

  useEffect(() => {
    if (error) {
      notify.failure("Loading networks failed", error);
    }
  }, [error]);

  const downstreamNetworks = networks.filter((downStreamCandidate) => {
    return (
      downStreamCandidate.config.network === formik.values.name ||
      downStreamCandidate.config.parent === formik.values.name ||
      network.used_by?.includes(`/1.0/networks/${downStreamCandidate.name}`)
    );
  });

  const instances = filterUsedByType("instance", network.used_by);
  const uplink = formik.values.parent ?? formik.values.network;

  const clusterUplinks = Object.keys(
    formik.values.parentPerClusterMember ?? {},
  ).map((clusterMember) => {
    const memberUplink = formik.values.parentPerClusterMember?.[clusterMember];

    if (!memberUplink) {
      return null;
    }

    return (
      <div className="uplink-item" key={clusterMember}>
        <span className="has-descendents">
          <ResourceLink
            type="cluster-member"
            value={clusterMember}
            to={`/ui/project/${project}/networks?member=${clusterMember}`}
          />
        </span>
        <ResourceLink
          type="network"
          value={memberUplink}
          to={`/ui/project/${project}/member/${clusterMember}/network/${memberUplink}`}
        />
      </div>
    );
  });

  const hasUplink =
    uplink ?? clusterUplinks.filter((item) => item !== null).length > 0;

  return (
    <>
      <h2 className="p-heading--4" id={slugify(CONNECTIONS)}>
        Connections
      </h2>
      <div className="u-sv3 network-topology">
        {hasUplink && (
          <div className="uplink">
            {hasClusteredUplinks
              ? clusterUplinks
              : uplink && (
                  <div className="uplink-item has-parent">
                    <ResourceLink
                      type="network"
                      value={uplink}
                      to={`/ui/project/default/network/${uplink}`}
                    />
                  </div>
                )}
          </div>
        )}
        <div
          className={classNames("current-network", {
            "has-descendents":
              instances.length > 0 || downstreamNetworks.length > 0,
            "has-parent": hasUplink,
          })}
        >
          {member && (
            <span className="has-descendents">
              <ResourceLink
                type="cluster-member"
                value={member}
                to={`/ui/project/${project}/networks?member=${member}`}
              />
            </span>
          )}
          <div
            className="p-chip is-inline is-dense resource-link active-chip"
            title={network.name}
          >
            <span className="p-chip__value">
              <Icon name="exposed" light />
              {network.name}
            </span>
          </div>
        </div>
        <div className="downstream">
          {downstreamNetworks
            .slice(0, isNetworksCollapsed ? 5 : downstreamNetworks.length)
            .map((item) => {
              const networkUrl = `/ui/project/default/network/${item.name}`;
              return (
                <div
                  key={networkUrl}
                  className={classnames("downstream-item", {
                    "has-descendents": (item.used_by ?? []).length > 0,
                  })}
                >
                  <ResourceLink
                    type="network"
                    value={item.name}
                    to={networkUrl}
                  />
                </div>
              );
            })}
          {downstreamNetworks.length > 5 && isNetworksCollapsed && (
            <div className="downstream-item">
              <Button
                appearance="link"
                onClick={() => setNetworksCollapsed(false)}
                small
              >
                Show all
              </Button>
            </div>
          )}
          {instances
            .slice(0, isInstancesCollapsed ? 5 : instances.length)
            .map((item) => {
              const instanceUrl = `/ui/project/${item.project}/instance/${item.name}`;
              return (
                <div key={instanceUrl} className="downstream-item">
                  <ResourceLink
                    type="instance"
                    value={item.name}
                    to={instanceUrl}
                  />
                </div>
              );
            })}
          {instances.length > 5 && isInstancesCollapsed && (
            <div className="downstream-item">
              <Button
                appearance="link"
                onClick={() => setInstancesCollapsed(false)}
                small
              >
                Show all
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NetworkTopology;
