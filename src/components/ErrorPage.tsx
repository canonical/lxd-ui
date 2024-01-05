import React, { FC } from "react";
import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Notification,
  Strip,
} from "@canonical/react-components";

type Props = {
  error?: Error;
};

const ErrorPage: FC<Props> = ({ error }) => {
  const body = encodeURIComponent(
    `\`\`\`\n${error?.stack ?? "No stack track"}\n\`\`\``,
  );
  const url = `https://github.com/canonical/lxd-ui/issues/new?labels=bug&title=Error%20report&body=${body}`;

  return (
    <Strip>
      <Notification severity="negative" title="Error">
        Something has gone wrong. If this issue persists,{" "}
        <a href={url} rel="noopener noreferrer" target="_blank">
          please raise an issue on GitHub.
        </a>
      </Notification>
      <CodeSnippet
        blocks={[
          ...(error?.message
            ? [
                {
                  title: "Error",
                  appearance: CodeSnippetBlockAppearance.NUMBERED,
                  wrapLines: true,
                  code: error.message,
                },
              ]
            : []),
          ...(error?.stack
            ? [
                {
                  title: "Stack trace",
                  appearance: CodeSnippetBlockAppearance.NUMBERED,
                  wrapLines: true,
                  code: error.stack,
                },
              ]
            : []),
        ]}
      />
    </Strip>
  );
};

export default ErrorPage;
