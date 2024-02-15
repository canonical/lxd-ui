import { FC, ReactNode } from "react";
import { Button, ButtonProps } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { PropsWithSpread } from "@canonical/react-components/dist/types";

type Props = PropsWithSpread<
  {
    project: string;
    pool: string;
    children: ReactNode;
  },
  ButtonProps
>;

const StorageVolumesInPoolBtn: FC<Props> = ({
  project,
  pool,
  children,
  ...buttonProps
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/ui/project/${project}/storage/volumes?pool=${pool}`);
  };

  return (
    <Button onClick={handleClick} {...buttonProps}>
      {children}
    </Button>
  );
};

export default StorageVolumesInPoolBtn;
