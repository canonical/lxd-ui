import { useState } from "react";
import type { FC, ReactNode } from "react";
import { Button, Icon, Tooltip } from "@canonical/react-components";

interface Props {
  value: string;
  children?: ReactNode;
  tooltipMessage?: string;
  onCopyButtonClick?: () => void;
}

const CopyToClipboard: FC<Props> = ({
  value,
  children,
  tooltipMessage,
  onCopyButtonClick,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopyButtonClick?.();

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  if (undefined === navigator.clipboard) {
    return <>{children}</>;
  }

  return (
    <div className="copy-to-clipboard-container">
      <div className="u-truncate">{children}</div>
      <Button
        appearance="base"
        type="button"
        hasIcon
        dense
        className="u-no-margin--bottom copy-to-clipboard-button"
        aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
        onClick={handleCopy}
      >
        {copied ? (
          <Icon
            className="copy-to-clipboard-button-wrapper"
            name="task-outstanding"
          />
        ) : (
          <Tooltip
            message={tooltipMessage ?? "Copy"}
            position="top-center"
            className="copy-to-clipboard-button-wrapper"
            zIndex={999}
          >
            <Icon name="copy-to-clipboard" />
          </Tooltip>
        )}
      </Button>
    </div>
  );
};

export default CopyToClipboard;
