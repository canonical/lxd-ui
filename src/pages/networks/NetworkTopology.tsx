import React, { FC } from "react";
import { FormikProps } from "formik/dist/types";
import { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import { slugify } from "util/slugify";
import { TOPOLOGY } from "pages/networks/forms/NetworkFormMenu";
import ResourceLink from "components/ResourceLink";
import { filterUsedByType } from "util/usedBy";
import { Icon } from "@canonical/react-components";

interface Props {
  formik: FormikProps<NetworkFormValues>;
}

const NetworkTopology: FC<Props> = ({ formik }) => {
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
          <>
            <ResourceLink
              type="network"
              value={uplink}
              to={`/ui/project/default/network/${uplink}`}
            />
            <div className="uplink-connection" />
          </>
        )}
        <div
          className="p-chip is-inline is-dense resource-link active"
          title={network.name}
        >
          <span className="p-chip__value">
            <Icon name="exposed" light />
            {network.name}
          </span>
        </div>
        {instances.length > 0 && <div className="uplink-connection" />}
        <div className="instances">
          {instances.map((item) => {
            const instanceUrl = `/ui/project/${item.project}/instance/${item.name}`;
            return (
              <ResourceLink
                key={instanceUrl}
                type="instance"
                value={item.name}
                to={instanceUrl}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default NetworkTopology;
