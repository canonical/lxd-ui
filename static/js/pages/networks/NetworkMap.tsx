import React, { FC } from "react";
import { Row } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import BaseLayout from "components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import useNotification from "util/useNotification";
import { useParams } from "react-router-dom";
import CytoscapeComponent from "react-cytoscapejs";
import { fetchInstances } from "api/instances";
import { isNicDevice } from "util/devices";
import { EdgeDefinition } from "cytoscape";
import { fetchNetworks } from "api/networks";
import { LxdInstance } from "types/instance";
import Loader from "components/Loader";

const NetworkMap: FC = () => {
  const notify = useNotification();
  const { project } = useParams<{
    project: string;
  }>();

  if (!project) {
    return <>Missing project</>;
  }

  const { data: instances = [], isLoading: instanceLoading } = useQuery({
    queryKey: [queryKeys.instances],
    queryFn: () => fetchInstances(project),
  });

  const { data: networks = [], isLoading: networkLoading } = useQuery({
    queryKey: [queryKeys.networks],
    queryFn: () => fetchNetworks(project),
  });

  if (instanceLoading || networkLoading) {
    return <Loader />;
  }

  const getInstanceColor = (instance: LxdInstance) => {
    switch (instance.status) {
      case "Running":
        return "#0E8420";
      default:
        return "#D9D9D9";
    }
  };

  const instanceNodes = instances.map((instance) => {
    return {
      data: {
        id: instance.name,
        label: instance.name,
      },
      style: {
        backgroundColor: getInstanceColor(instance),
      },
    };
  });

  const networkNodes = networks.map((network) => {
    return {
      data: { id: network.name, label: network.name },
      style: {
        shape: "square",
        backgroundColor: "#0066cc",
      },
    };
  });

  const edges: EdgeDefinition[] = [];
  instances.map((instance) =>
    Object.values(instance.expanded_devices)
      .filter(isNicDevice)
      .map((network) => {
        edges.push({
          data: { source: instance.name, target: network.network, label: "" },
          style: {
            lineColor: "#D9D9D9",
          },
        });
      })
  );

  const elements = [...networkNodes, ...instanceNodes, ...edges];

  return (
    <>
      <BaseLayout title="Network map (beta)">
        <NotificationRow notify={notify} />
        <Row>
          <CytoscapeComponent
            elements={elements}
            style={{
              width: "100vw",
              height: "calc(100vh - 130px)",
            }}
            layout={{
              name: "cose",
              nodeDimensionsIncludeLabels: true,
              animate: false,
            }}
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default NetworkMap;
