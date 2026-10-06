import { Button } from "@canonical/react-components";
import type { FC, MouseEventHandler, ReactNode } from "react";
import DsIcon from "components/DsIcon";

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
        <DsIcon icon="chevron-left" className="back-link-icon" />
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
