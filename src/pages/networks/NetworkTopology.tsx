import React, { FC, useState } from "react";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { slugify } from "util/slugify";
import { TOPOLOGY } from "pages/networks/forms/NetworkFormMenu";
import ResourceLink from "components/ResourceLink";
import { filterUsedByType } from "util/usedBy";
import { Button, Icon } from "@canonical/react-components";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchNetworks } from "api/networks";
import classnames from "classnames";

interface Props {
  formik: FormikProps<NetworkFormValues>;
  project: string;
}

const NetworkTopology: FC<Props> = ({ formik, project }) => {
  const [isCollapsed, setCollapsed] = useState(true);
  const network = formik.values.bareNetwork;

  if (!network) {
    return;
  }

  const { data: networks = [] } = useQuery({
    queryKey: [queryKeys.projects, project, queryKeys.networks],
    queryFn: () => fetchNetworks(project),
  });

  const downstreamNetworks = networks.filter(
    (network) =>
      network.config.network === formik.values.name ||
      network.config.parent === formik.values.name,
  );

  const instances = filterUsedByType("instance", network.used_by);
  const uplink = formik.values.parent ?? formik.values.network;

  return (
    <>
      <h2 className="p-heading--4" id={slugify(TOPOLOGY)}>
        Topology
      </h2>
      <div className="u-sv3 network-topology">
        {uplink && (
          <div className="uplink">
            <ResourceLink
              type="network"
              value={uplink}
              to={`/ui/project/default/network/${uplink}`}
            />
          </div>
        )}
        <div
          className={classNames("current-network", {
            "has-descendents":
              instances.length > 0 || downstreamNetworks.length > 0,
            "has-parent": !!uplink,
          })}
        >
          <div
            className="p-chip is-inline is-dense resource-link"
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
            .slice(0, isCollapsed ? 5 : downstreamNetworks.length)
            .map((item) => {
              const networkUrl = `/ui/project/default/network/${item.name}`;
              return (
                <div
                  key={networkUrl}
                  className={classnames("downstream-item", {
                    "has-descendents":
                      downstreamNetworks.length > 0 || instances.length > 0,
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
          {downstreamNetworks.length > 5 && isCollapsed && (
            <div className="downstream-item">
              <Button
                appearance="link"
                onClick={() => setCollapsed(false)}
                small
              >
                Show all
              </Button>
            </div>
          )}
          {instances
            .slice(0, isCollapsed ? 5 : instances.length)
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
          {instances.length > 5 && isCollapsed && (
            <div className="downstream-item">
              <Button
                appearance="link"
                onClick={() => setCollapsed(false)}
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
