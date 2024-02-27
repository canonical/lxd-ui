import { FC } from "react";
import { Button } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";

interface Props {
  className?: string;
  groupType?: "lxd-groups" | "idp-groups";
}

const CreatePermissionGroupBtn: FC<Props> = ({
  className,
  groupType = "lxd-groups",
}) => {
  const navigate = useNavigate();

  return (
    <Button
      appearance="positive"
      className={className}
      hasIcon
      onClick={() => navigate(`/ui/permissions/${groupType}/create`)}
    >
      Create group
    </Button>
  );
};

export default CreatePermissionGroupBtn;
