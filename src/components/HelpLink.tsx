import { FC, ReactNode } from "react";
import { Icon } from "@canonical/react-components";

interface Props {
  children: ReactNode;
  href: string;
  title: string;
}

const HelpLink: FC<Props> = ({ children, href, title }) => {
  return (
    <div className="help-link">
      {children}
      <a href={href} target="_blank" rel="noopener noreferrer" title={title}>
        <Icon name="info--dark" className="help-link-icon" />
      </a>
    </div>
  );
};

export default HelpLink;
