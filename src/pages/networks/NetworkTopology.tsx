import React, { FC, useState } from "react";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { slugify } from "util/slugify";
import { TOPOLOGY } from "pages/networks/forms/NetworkFormMenu";
import ResourceLink from "components/ResourceLink";
import { filterUsedByType } from "util/usedBy";
import { Button, Icon } from "@canonical/react-components";
import classNames from "classnames";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkTopology: FC<Props> = ({ formik }) => {
  const [isCollapsed, setCollapsed] = useState(true);
  const network = formik.values.bareNetwork;

  if (!network) {
    return;
  }

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
            "has-descendents": instances.length > 0,
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
        <div className="instances">
          {instances
            .slice(0, isCollapsed ? 5 : instances.length)
            .map((item) => {
              const instanceUrl = `/ui/project/${item.project}/instance/${item.name}`;
              return (
                <div key={instanceUrl} className="instance">
                  <ResourceLink
                    type="instance"
                    value={item.name}
                    to={instanceUrl}
                  />
                </div>
              );
            })}
          {instances.length > 5 && isCollapsed && (
            <div className="instance">
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
