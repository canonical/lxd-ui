import React, { FC } from "react";
import { LxdInstance } from "types/instance";
import { Button, Icon } from "@canonical/react-components";
import classnames from "classnames";
import { useInstanceStart } from "util/instanceStart";

interface Props {
  instance: LxdInstance;
}

const StartInstanceBtn: FC<Props> = ({ instance }) => {
  const { handleStart, isLoading, isDisabled } = useInstanceStart(instance);

  return (
    <Button
      appearance="base"
      hasIcon
      dense={true}
      disabled={isDisabled}
      onClick={handleStart}
      type="button"
      aria-label={isLoading ? "Starting" : "Start"}
      title="Start"
    >
      <Icon
        className={classnames({ "u-animation--spin": isLoading })}
        name={isLoading ? "spinner" : "play"}
      />
    </Button>
  );
};

export default StartInstanceBtn;
