import { Button, Icon } from "@canonical/react-components";
import type { FC, ReactNode } from "react";

interface Props {
  linkText: string;
  title: ReactNode;
  onClick: () => void;
}

const BackLink: FC<Props> = ({ linkText, title, onClick }) => {
  const backLink = (
    <>
      <Button
        onClick={onClick}
        dense
        hasIcon
        appearance="link"
        className="p-heading--4"
      >
        <Icon name="chevron-left" className="back-link-icon" />
        {linkText}
      </Button>
    </>
  );

  return (
    <>
      {backLink} / {title}
    </>
  );
};

export default BackLink;
