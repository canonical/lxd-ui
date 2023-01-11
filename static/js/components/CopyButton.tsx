import React, { FC, useState } from "react";
import { Tooltip, Button } from "@canonical/react-components";
import { Position } from "@canonical/react-components/dist/components/Tooltip/Tooltip";

interface Props {
  text: string;
  className?: string;
  tooltipPosition?: Position;
}

const CopyButton: FC<Props> = ({
  text,
  className,
  tooltipPosition = "left",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <span className={className}>
      <Tooltip
        message={copied ? "Copied!" : "Copy to clipboard"}
        position={tooltipPosition}
      >
        <Button
          hasIcon
          dense
          aria-label={"Copy to clipboard"}
          onClick={handleCopy}
        >
          <i
            className={
              copied ? "p-icon--task-outstanding" : "p-icon--copy-to-clipboard"
            }
          >
            Copy to clipboard
          </i>
        </Button>
      </Tooltip>
    </span>
  );
};

export default CopyButton;
