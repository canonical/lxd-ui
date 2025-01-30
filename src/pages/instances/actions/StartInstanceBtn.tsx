import { FC } from "react";
import type { LxdInstance } from "types/instance";
import { Button, Icon } from "@canonical/react-components";
import classnames from "classnames";
import { useInstanceStart } from "util/instanceStart";
import { useInstanceEntitlements } from "util/entitlements/instances";

interface Props {
  instance: LxdInstance;
}

const StartInstanceBtn: FC<Props> = ({ instance }) => {
  const { handleStart, isLoading, isDisabled } = useInstanceStart(instance);
  const { canUpdateInstanceState } = useInstanceEntitlements(instance);

  return (
    <Button
      appearance="base"
      hasIcon
      dense={true}
      disabled={isDisabled || !canUpdateInstanceState()}
      onClick={handleStart}
      type="button"
      aria-label={isLoading ? "Starting" : "Start"}
      title={
        canUpdateInstanceState()
          ? "Start"
          : "You do not have permission to start this instance"
      }
    >
      <Icon
        className={classnames({ "u-animation--spin": isLoading })}
        name={isLoading ? "spinner" : "play"}
      />
    </Button>
  );
};

export default StartInstanceBtn;
