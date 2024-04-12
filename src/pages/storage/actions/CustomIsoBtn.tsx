import { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";

interface Props {
  project: string;
}

const CustomIsoBtn: FC<Props> = ({ project }) => {
  const navigate = useNavigate();
  const href = `/ui/project/${project}/storage/custom-isos`;

  const handleClick = () => (e: MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <Button
      className="u-no-margin--bottom u-float-right"
      hasIcon
      href={href}
      onClick={handleClick}
      element="a"
    >
      <span>Custom ISOs</span>
      <Icon name="external-link" />
    </Button>
  );
};

export default CustomIsoBtn;
