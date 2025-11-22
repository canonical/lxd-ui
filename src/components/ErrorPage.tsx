import type { FC } from "react";
import { useEffect } from "react";
import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Notification,
  Strip,
  useListener,
} from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import { getReportBugURL } from "util/reportBug";

interface Props {
  error?: Error;
}

const ErrorPage: FC<Props> = ({ error }) => {
  const url = getReportBugURL(error);

  const updateHeight = () => {
    updateMaxHeight("error-info", undefined, 0, "max-height");
  };
  useEffect(updateHeight, []);
  useListener(window, updateHeight, "resize", true);

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
