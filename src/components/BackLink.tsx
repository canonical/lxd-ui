import { Button, Icon } from "@canonical/react-components";
import type { FC, MouseEventHandler, ReactNode } from "react";

interface Props {
  linkText: string;
  title: ReactNode;
  onClick: () => void;
  onMouseDown?: MouseEventHandler<HTMLButtonElement>;
}

const BackLink: FC<Props> = ({ linkText, title, onClick, onMouseDown }) => {
  const backLink = (
    <>
      <Button
        onClick={onClick}
        onMouseDown={onMouseDown}
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
