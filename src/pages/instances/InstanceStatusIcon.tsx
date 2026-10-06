import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { useInstanceLoading } from "context/instanceLoading";
import InstanceStatus from "pages/instances/InstanceStatus";
import DsIcon from "components/DsIcon";

interface Props {
  instance: LxdInstance;
}

const InstanceStatusIcon: FC<Props> = ({ instance }) => {
  const instanceLoading = useInstanceLoading();
  const loadingType = instanceLoading.getType(instance);

  if (loadingType) {
    return (
      <>
        <DsIcon className="u-animation--spin status-icon" icon="spinner" />
        <i>{loadingType}</i>
      </>
    );
  }

  return <InstanceStatus status={instance.status} />;
};

export default InstanceStatusIcon;
