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
      <Icon name="chevron-left" />{" "}
      <Button
        onClick={onClick}
        dense
        appearance="link"
        className="p-heading--4"
      >
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
