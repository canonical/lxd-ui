import { FC, useEffect } from "react";
import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Notification,
  Strip,
} from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";

type Props = {
  error?: Error;
};

const ErrorPage: FC<Props> = ({ error }) => {
  const body = encodeURIComponent(
    `\`\`\`\n${error?.stack ?? "No stack trace"}\n\`\`\``,
  );
  const url = `https://github.com/canonical/lxd-ui/issues/new?labels=bug&title=Error%20report&body=${body}`;

  const updateHeight = () => {
    updateMaxHeight("error-info", undefined, 0, "max-height");
  };
  useEffect(updateHeight, []);
  useEventListener("resize", updateHeight);

  return (
    <Strip className="u-no-padding--bottom">
      <Notification severity="negative" title="Error">
        Something has gone wrong. If this issue persists,{" "}
        <a href={url} rel="noopener noreferrer" target="_blank">
          please raise an issue on GitHub.
        </a>
      </Notification>
      <CodeSnippet
        className="error-info u-no-margin--bottom"
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
