import { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { useSmallScreen } from "context/useSmallScreen";

interface Props {
  project: string;
}

const CustomIsoBtn: FC<Props> = ({ project }) => {
  const navigate = useNavigate();
  const href = `/ui/project/${project}/storage/custom-isos`;
  const isSmallScreen = useSmallScreen();

  const handleClick = () => (e: MouseEvent) => {
    e.preventDefault();
    void navigate(href);
  };

  return (
    <Button
      className="u-no-margin--bottom u-float-right"
      hasIcon={!isSmallScreen}
      href={href}
      onClick={handleClick}
      element="a"
    >
      {!isSmallScreen && <Icon name="iso" />}
      <span>Custom ISOs</span>
    </Button>
  );
};

export default CustomIsoBtn;
