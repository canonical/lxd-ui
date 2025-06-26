import { Icon } from "@canonical/react-components";
import { useAuth } from "context/auth";
import type { FC } from "react";
import { Link } from "react-router-dom";
import type { LxdProject } from "types/project";

interface Props {
  project?: LxdProject;
}

const SnapshotDisabledWarningLink: FC<Props> = ({ project }) => {
  const { isRestricted } = useAuth();

  return isRestricted ? (
    <>Please ask your project administrator to change this setting.</>
  ) : (
    <>
      You can change this setting in{" "}
      <Link
        to={`/ui/project/${encodeURIComponent(project?.name ?? "")}/configuration`}
      >
        project configuration
        <Icon className="external-link-icon" name="external-link" />
      </Link>
    </>
  );
};

export default SnapshotDisabledWarningLink;
