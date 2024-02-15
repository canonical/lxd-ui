import { Icon } from "@canonical/react-components";
import { useAuth } from "context/auth";
import { FC } from "react";
import { Link } from "react-router-dom";
import { LxdProject } from "types/project";

interface Props {
  project?: LxdProject;
}

const SnapshotDiabledWarningLink: FC<Props> = ({ project }) => {
  const { isRestricted } = useAuth();

  const snapshotDisabledWarningLink = isRestricted ? (
    <>Please ask your project administrator to change this setting.</>
  ) : (
    <>
      You can change this setting in{" "}
      <Link to={`/ui/project/${project?.name}/configuration`}>
        project configuration
        <Icon className="external-link-icon" name="external-link" />
      </Link>
    </>
  );

  return snapshotDisabledWarningLink;
};

export default SnapshotDiabledWarningLink;
