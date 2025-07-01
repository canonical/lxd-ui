import type { FC, ReactNode } from "react";
import type { ButtonProps } from "@canonical/react-components";
import { Button } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import type { PropsWithSpread } from "@canonical/react-components/dist/types";

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
    navigate(
      `/ui/project/${encodeURIComponent(project)}/storage/volumes?pool=${encodeURIComponent(pool)}`,
    );
  };

  return (
    <Button onClick={handleClick} {...buttonProps}>
      {children}
    </Button>
  );
};

export default StorageVolumesInPoolBtn;
