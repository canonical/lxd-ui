import { FC, useEffect } from "react";
import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Notification,
  Strip,
} from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "util/useEventListener";
import { UI_VERSION } from "util/version";

type Props = {
  error?: Error;
};

const ErrorPage: FC<Props> = ({ error }) => {
  const body = encodeURIComponent(
    `# Description

A brief description of the problem. Should include what you were
attempting to do, what you did, what happened and what you expected to
see happen.

# Metadata

UI Version: ${UI_VERSION}
Path: ${location.pathname}${location.search}

# Stacktrace

\`\`\`
${error?.stack ?? "No stack trace"}
\`\`\``,
  );
  const url = `https://github.com/canonical/lxd-ui/issues/new?labels=bug&title=Error%20report&body=${body}`;

  const updateHeight = () => {
    updateMaxHeight("error-info", undefined, 0, "max-height");
  };
  useEffect(updateHeight, []);
  useEventListener("resize", updateHeight);

  const errorBlocks = [];
  if (error?.message) {
    errorBlocks.push({
      title: "Error",
      appearance: CodeSnippetBlockAppearance.NUMBERED,
      wrapLines: true,
      code: error.message,
    });
  }

  if (error?.message.toLowerCase().includes("dynamically imported module")) {
    errorBlocks.push({
      title: "Possible causes",
      appearance: CodeSnippetBlockAppearance.NUMBERED,
      wrapLines: true,
      code: `This might be due to a temporary network issue. Please try refreshing the page.
If the problem continues, ensure your connection to the LXD server is active or try again later.`,
    });
  }

  if (error?.stack) {
    errorBlocks.push({
      title: "Stack trace",
      appearance: CodeSnippetBlockAppearance.NUMBERED,
      wrapLines: true,
      code: error.stack,
    });
  }

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
        blocks={errorBlocks}
      />
    </Strip>
  );
};

export default ErrorPage;
