import { type FC, type ReactNode } from "react";
import classNames from "classnames";
import { Tooltip } from "@canonical/react-components";
import DocLink from "components/DocLink";
import DsIcon from "components/DsIcon";

interface Props {
  explanation: ReactNode;
  docPath: string;
  docLabel?: string;
  className?: string;
  children?: ReactNode;
}

const ExplanationTooltip: FC<Props> = ({
  explanation,
  docPath,
  docLabel = "Learn more",
  className,
  children,
}) => {
  const tooltip = (
    <Tooltip
      zIndex={1000}
      tooltipClassName="explanation-tooltip-portal"
      position="btm-center"
      message={
        <span className="explanation-tooltip">
          <span>{explanation}</span>
          <DocLink docPath={docPath} hasExternalIcon>
            {docLabel}
          </DocLink>
        </span>
      }
    >
      <DsIcon icon="help" className="explanation-tooltip-icon" />
    </Tooltip>
  );

  return (
    <span className={classNames("explanation-tooltip-wrapper", className)}>
      {children}
      {tooltip}
    </span>
  );
};

export default ExplanationTooltip;
