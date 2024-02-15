import { FC } from "react";
import { LxdUsedBy } from "util/usedBy";
import ViewProfileInstancesLink from "./actions/ViewProfileInstancesLink";

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
            <ViewProfileInstancesLink profile={profile} project={project} />
          </td>
        </tr>
      )}
    </>
  );
};

export default ProfileUsedByRegularProject;
