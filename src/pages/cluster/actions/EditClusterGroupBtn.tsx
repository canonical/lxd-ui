import type { FC } from "react";
import { Button } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";

interface Props {
  group: string;
}

const EditClusterGroupBtn: FC<Props> = ({ group }) => {
  const navigate = useNavigate();

  return (
    <Button
      className="u-no-margin--bottom"
      onClick={async () =>
        navigate(`/ui/cluster/group/${encodeURIComponent(group)}/edit`)
      }
    >
      Edit group
    </Button>
  );
};

export default EditClusterGroupBtn;
