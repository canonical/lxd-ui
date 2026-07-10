import { type FC } from "react";
import { Icon, Tooltip } from "@canonical/react-components";
import DocLink from "components/DocLink";

interface Props {
  explanation: string;
  docPath: string;
  docLabel?: string;
}

const ExplanationTooltip: FC<Props> = ({
  explanation,
  docPath,
  docLabel = "Learn more",
}) => {
  const tooltip = (
    <Tooltip
      zIndex={1000}
      tooltipClassName="explanation-tooltip-portal"
      position="btm-right"
      message={
        <span className="explanation-tooltip">
          <span>{explanation}</span>
          <DocLink docPath={docPath} hasExternalIcon>
            {docLabel}
          </DocLink>
        </span>
      }
    >
      <Icon name="information" className="explanation-tooltip-icon" />
    </Tooltip>
  );

  return tooltip;
};

export default ExplanationTooltip;
