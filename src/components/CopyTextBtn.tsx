import type { FC } from "react";
import { useState } from "react";
import { Button, Icon } from "@canonical/react-components";

interface Props {
  label: string;
  text: string;
}

const CopyTextBtn: FC<Props> = ({ label, text }) => {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 5000);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Button
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
      className="u-no-margin--bottom"
      onClick={copyText}
      type="button"
      hasIcon
    >
      <Icon name={copied ? "task-outstanding" : "copy"} />
      <span>{label}</span>
    </Button>
  );
};

export default CopyTextBtn;
