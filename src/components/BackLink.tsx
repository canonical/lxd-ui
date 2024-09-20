import { Button, Icon } from "@canonical/react-components";
import { FC } from "react";

interface Props {
  linkText: string;
  title: string;
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
