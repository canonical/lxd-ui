import type { FC, ReactNode } from "react";
import classnames from "classnames";
import { Tooltip } from "@canonical/react-components";

interface Props {
  percentage: number;
  secondaryPercentage?: number;
  text: string;
  hoverText?: ReactNode;
  ariaLabelledby?: string;
}

const Meter: FC<Props> = ({
  percentage,
  secondaryPercentage = 0,
  text,
  hoverText,
  ariaLabelledby,
}) => {
  return (
    <div className="p-meter-wrapper">
      <Tooltip message={hoverText}>
        <div
          className="p-meter u-no-margin--bottom"
          role="meter"
          aria-labelledby={ariaLabelledby}
          aria-label={ariaLabelledby ? undefined : text}
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            style={{ width: `max(${percentage}%, 5px)` }}
            className={classnames({
              "has-next-sibling": secondaryPercentage > 0,
            })}
          />
          {secondaryPercentage > 0 && (
            <div
              className="has-previous-sibling"
              style={{ width: `${secondaryPercentage}%` }}
            />
          )}
        </div>
        <div className="p-text--small u-no-margin--bottom u-text--muted">
          {text}
        </div>
      </Tooltip>
    </div>
  );
};

export default Meter;
