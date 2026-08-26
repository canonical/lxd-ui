import type { FC } from "react";
import DocLink from "components/DocLink";

interface Props {
  explanation: string;
  docPath: string;
  docLabel: string;
}

const InlineExplanation: FC<Props> = ({ explanation, docPath, docLabel }) => {
  return (
    <>
      <p className="p-text--small u-text--muted">{explanation}</p>
      <p className="p-text--small">
        <DocLink docPath={docPath} hasExternalIcon>
          {docLabel}
        </DocLink>
      </p>
    </>
  );
};

export default InlineExplanation;
