import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { useInstanceLoading } from "context/instanceLoading";
import { Icon } from "@canonical/react-components";
import InstanceStatus from "pages/instances/InstanceStatus";

interface Props {
  instance: LxdInstance;
}

const InstanceStatusIcon: FC<Props> = ({ instance }) => {
  const instanceLoading = useInstanceLoading();
  const loadingType = instanceLoading.getType(instance);

  return loadingType ? (
    <>
      <Icon className="u-animation--spin status-icon" name="spinner" />
      <i>{loadingType}</i>
    </>
  ) : (
    <InstanceStatus status={instance.status} />
  );
};

export default InstanceStatusIcon;
