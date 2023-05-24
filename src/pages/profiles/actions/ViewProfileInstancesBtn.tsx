import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@canonical/react-components";

interface Props {
  profile: string;
  project: string;
}

const ViewProfileInstancesBtn: FC<Props> = ({ profile, project }) => {
  const navigate = useNavigate();

  return (
    <Button
      appearance="link"
      className="u-no-margin u-no-padding"
      small
      onClick={() => {
        navigate(`/ui/project/${project}/instances`, {
          state: {
            appliedProfile: profile,
          },
        });
      }}
    >
      Go to instances
    </Button>
  );
};

export default ViewProfileInstancesBtn;
