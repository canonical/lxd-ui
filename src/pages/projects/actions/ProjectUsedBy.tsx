import { type FC } from "react";
import type { LxdProject } from "types/project";
import UsedByRow from "components/UsedByRow";

interface Props {
  project: LxdProject;
}

const ProjectUsedBy: FC<Props> = ({ project }) => {
  const usedBy = project.used_by?.filter(
    (t) => !t.startsWith("/1.0/profiles/default"),
  );

  return (
    <table className="p-main-table delete-project-table">
      <tbody>
        <UsedByRow entityType="instance" usedBy={usedBy} />
        <UsedByRow entityType="profile" usedBy={usedBy} />
        <UsedByRow entityType="image" usedBy={usedBy} />
        <UsedByRow entityType="volume" usedBy={usedBy} />
      </tbody>
    </table>
  );
};

export default ProjectUsedBy;
