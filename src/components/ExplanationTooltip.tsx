import { type FC, type ReactNode } from "react";
import classNames from "classnames";
import { Icon, Tooltip } from "@canonical/react-components";
import DocLink from "components/DocLink";

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
      position="top-center"
      message={
        <span className="explanation-tooltip">
          <span>{explanation}</span>
          <DocLink docPath={docPath} hasExternalIcon>
            {docLabel}
          </DocLink>
        </span>
      }
    >
      <Icon name="help" className="explanation-tooltip-icon" />
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
