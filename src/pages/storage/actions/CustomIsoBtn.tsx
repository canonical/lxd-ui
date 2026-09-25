import type { FC } from "react";
import { Button } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { ROOT_PATH } from "util/rootPath";
import DsIcon from "components/DsIcon";

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
      {!isSmallScreen && <DsIcon icon="iso" />}
      <span>Custom ISOs</span>
    </Button>
  );
};

export default CustomIsoBtn;
