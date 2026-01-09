import type { FC } from "react";
import type { ValueOf } from "@canonical/react-components";
import { CodeSnippetBlockAppearance } from "@canonical/react-components";
import { CodeSnippet } from "@canonical/react-components";
import CopyToClipboard from "components/CopyToClipboard";
import classnames from "classnames";

interface Props {
  code: string;
  className?: string;
  appearance?: ValueOf<typeof CodeSnippetBlockAppearance>;
  title?: string;
  tooltipMessage?: string;
  onCopyButtonClick?: () => void;
}

const CodeSnippetWithCopyButton: FC<Props> = ({
  code,
  className,
  appearance = CodeSnippetBlockAppearance.LINUX_PROMPT,
  title,
  tooltipMessage,
  onCopyButtonClick,
}) => {
  return (
    <CodeSnippet
      className={classnames("code-snippet-with-copy-button-wrapper", className)}
      blocks={[
        {
          appearance,
          title,
          code: (
            <div className="command-wrapper">
              <span className="command u-truncate" title={code}>
                {code}
              </span>
              <CopyToClipboard
                value={code}
                tooltipMessage={tooltipMessage}
                onCopyButtonClick={onCopyButtonClick}
              />
            </div>
          ),
        },
      ]}
    />
  );
};

export default CodeSnippetWithCopyButton;
