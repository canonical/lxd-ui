import React, { FC } from "react";
import { LxdUsedBy } from "util/usedBy";
import ViewProfileInstancesBtn from "./actions/ViewProfileInstancesBtn";

interface Props {
  profile: string;
  project: string;
  usedByInstances: LxdUsedBy[];
}

const ProfileUsedByRegularProject: FC<Props> = ({
  profile,
  project,
  usedByInstances,
}) => {
  return (
    <>
      {usedByInstances.length > 0 && (
        <tr>
          <td>
            <ViewProfileInstancesBtn profile={profile} project={project} />
          </td>
        </tr>
      )}
    </>
  );
};

export default ProfileUsedByRegularProject;
