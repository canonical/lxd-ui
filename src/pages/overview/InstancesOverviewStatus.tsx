import { type FC } from "react";
import ChartLegend from "components/ChartLegend";
import { capitalizeFirstLetter } from "util/helpers";
import {
  getInstanceStatusColor,
  type OverviewInstanceStatus,
} from "util/overviewInstances";

interface Props {
  status: OverviewInstanceStatus;
}

const InstancesOverviewStatus: FC<Props> = ({ status }) => {
  return (
    <ChartLegend
      className="group-by-status"
      items={[
        {
          color: getInstanceStatusColor(status),
          label: capitalizeFirstLetter(status),
        },
      ]}
    />
  );
};

export default InstancesOverviewStatus;
