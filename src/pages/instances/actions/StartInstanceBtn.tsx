import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import { Button, Icon } from "@canonical/react-components";
import classnames from "classnames";
import { useInstanceStart } from "util/instanceStart";
import { useInstanceEntitlements } from "util/entitlements/instances";
import { isInstanceRunning } from "util/instanceStatus";

interface Props {
  instance: LxdInstance;
  hasLabel?: boolean;
  appearance?: "base" | "positive";
  dense?: boolean;
  iconClassname?: string;
  showBooting?: boolean;
}

const StartInstanceBtn: FC<Props> = ({
  instance,
  hasLabel = false,
  appearance = "base",
  dense = true,
  iconClassname,
  showBooting = false,
}) => {
  const { handleStart, isLoading, isDisabled } = useInstanceStart(instance);
  const isRunning = isInstanceRunning(instance);
  const isBooting = isRunning && (instance.state?.processes ?? 0) < 1;
  const showSpinner = showBooting ? isLoading || isBooting : isLoading;
  const { canUpdateInstanceState } = useInstanceEntitlements();

  return (
    <Button
      appearance={appearance}
      hasIcon
      dense={dense}
      disabled={isDisabled || !canUpdateInstanceState(instance) || isBooting}
      onClick={handleStart}
      type="button"
      aria-label={showSpinner ? "Starting" : "Start"}
      title={
        canUpdateInstanceState(instance)
          ? "Start"
          : "You do not have permission to start this instance"
      }
    >
      <Icon
        className={classnames(iconClassname, {
          "u-animation--spin": showSpinner,
        })}
        name={showSpinner ? "spinner" : "play"}
      />
      {hasLabel && <span>Start instance</span>}
    </Button>
  );
};

export default StartInstanceBtn;
