import type { FC, ReactNode } from "react";

import DocLink from "components/DocLink";
import DsIcon from "components/DsIcon";

interface Props {
  children: ReactNode;
  title: string;
  docPath: string;
}

const HelpLink: FC<Props> = ({ children, title, docPath }) => {
  return (
    <div className="help-link">
      {children}
      <DocLink docPath={docPath} title={title} className="help-link-doc-link">
        <DsIcon icon="help" className="help-link-icon" />
      </DocLink>
    </div>
  );
};

export default HelpLink;
