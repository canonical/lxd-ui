import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { Button, Icon } from "@canonical/react-components";
import classnames from "classnames";
import { useInstanceStart } from "util/instanceStart";
import { useInstanceEntitlements } from "util/entitlements/instances";

interface Props {
  instance: LxdInstance;
  classname?: string;
}

const StartInstanceBtn: FC<Props> = ({ instance, classname }) => {
  const { handleStart, isLoading, isDisabled } = useInstanceStart(instance);
  const { canUpdateInstanceState } = useInstanceEntitlements();

  return (
    <Button
      appearance="base"
      disabled={isDisabled || !canUpdateInstanceState(instance)}
      onClick={handleStart}
      type="button"
      aria-label={isLoading ? "Starting" : "Start"}
      title={
        canUpdateInstanceState(instance)
          ? "Start"
          : "You do not have permission to start this instance"
      }
      className={classnames("has-icon", classname ?? "is-dense")}
    >
      <Icon
        className={classnames({ "u-animation--spin": isLoading })}
        name={isLoading ? "spinner" : "play"}
      />
      {classname && <span>Start</span>}
    </Button>
  );
};

export default StartInstanceBtn;
