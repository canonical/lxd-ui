import type { FC } from "react";
import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
} from "@canonical/react-components";
import CopyToClipboard from "components/CopyToClipboard";
import classnames from "classnames";

interface Props {
  code: string;
  className?: string;
}

const CodeSnippetWithCopyButton: FC<Props> = ({ code, className }) => {
  return (
    <CodeSnippet
      className={classnames("code-snippet-with-copy-button-wrapper", className)}
      blocks={[
        {
          appearance: CodeSnippetBlockAppearance.LINUX_PROMPT,
          code: (
            <div className="command-wrapper">
              <span className="command u-truncate" title={code}>
                {code}
              </span>
              <CopyToClipboard value={code} />
            </div>
          ),
        },
      ]}
    />
  );
};

export default CodeSnippetWithCopyButton;
