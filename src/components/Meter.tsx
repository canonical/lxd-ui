import { FC } from "react";
import classnames from "classnames";

interface Props {
  percentage: number;
  secondaryPercentage?: number;
  text: string;
  hoverText?: string;
}

const Meter: FC<Props> = ({
  percentage,
  secondaryPercentage = 0,
  text,
  hoverText,
}: Props) => {
  return (
    <>
      <div className="p-meter u-no-margin--bottom" title={hoverText}>
        <div
          style={{ width: `max(${percentage}%, 5px)` }}
          className={classnames({
            "has-next-sibling": secondaryPercentage > 0,
          })}
        />
        {secondaryPercentage ? (
          <div
            className="has-previous-sibling"
            style={{ width: `${secondaryPercentage}%` }}
          />
        ) : null}
      </div>
      <div className="p-text--small u-no-margin--bottom u-text--muted">
        {text}
      </div>
    </>
  );
};

export default Meter;
