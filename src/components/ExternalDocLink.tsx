import type { FC, ReactNode } from "react";
import { Icon } from "@canonical/react-components";
import DocLink from "components/DocLink";

interface Props {
  docPath: string;
  content: ReactNode;
}

const ExternalDocLink: FC<Props> = ({ docPath, content }) => {
  return (
    <DocLink
      docPath={docPath}
      content={
        <>
          {content}
          <Icon className="external-link-icon" name="external-link" />
        </>
      }
    />
  );
};

export default ExternalDocLink;
