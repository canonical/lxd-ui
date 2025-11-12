import type { FC, ReactNode } from "react";
import { Icon } from "@canonical/react-components";
import DocLink from "components/DocLink";

interface Props {
  children: ReactNode;
  title: string;
  docPath: string;
}

const HelpLink: FC<Props> = ({ children, title, docPath }) => {
  return (
    <div className="help-link">
      {children}
      <DocLink
        docPath={docPath}
        title={title}
        className="help-link-doc-link"
        content={<Icon name="information" className="help-link-icon" />}
      />
    </div>
  );
};

export default HelpLink;
