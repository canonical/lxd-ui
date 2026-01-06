import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  project: string;
}

const CustomIsoBtn: FC<Props> = ({ project }) => {
  const navigate = useNavigate();
  const href = `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/custom-isos`;
  const isSmallScreen = useIsScreenBelow();

  const handleClick = () => (e: MouseEvent) => {
    e.preventDefault();
    navigate(href);
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
