import type { CSSProperties, FC } from "react";
import classnames from "classnames";

const DEFAULT_MAX_SEGMENTS = 24;

interface Props {
  percentage: number;
  secondaryPercentage?: number;
  text: string;
  hoverText?: string;
  ariaLabelledby?: string;
  isSegmented?: boolean;
  totalSegments?: number;
  maxSegmentThreshold?: number;
}

const Meter: FC<Props> = ({
  percentage,
  secondaryPercentage = 0,
  text,
  hoverText,
  ariaLabelledby,
  isSegmented,
  totalSegments = 1,
  maxSegmentThreshold = DEFAULT_MAX_SEGMENTS,
}) => {
  // If segment count is too high, fallback to standard meter
  const shouldRenderSegments =
    isSegmented && totalSegments > 0 && totalSegments <= maxSegmentThreshold;

  if (shouldRenderSegments) {
    const filledSegments = (percentage / 100) * totalSegments;

    return (
      <>
        <div
          className="p-meter p-meter--segmented"
          title={hoverText}
          role="meter"
          aria-labelledby={ariaLabelledby}
          style={{ "--total-segments": totalSegments } as CSSProperties}
        >
          {Array.from({ length: totalSegments }).map((_, index) => {
            const segmentFill = Math.min(
              1,
              Math.max(0, filledSegments - index),
            );

            return (
              <div key={index} className="p-meter__segment">
                {segmentFill > 0 && (
                  <div
                    className="p-meter__segment-fill"
                    style={{ width: `max(${segmentFill * 100}%, 2px)` }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="p-text--small u-no-margin--bottom u-text--muted">
          {text}
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="p-meter u-no-margin--bottom"
        title={hoverText}
        role="meter"
        aria-labelledby={ariaLabelledby}
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
    </>
  );
};

export default Meter;
