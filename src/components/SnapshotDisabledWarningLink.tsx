import { useAuth } from "context/auth";
import type { FC } from "react";
import { Link } from "react-router-dom";
import type { LxdProject } from "types/project";
import { ROOT_PATH } from "util/rootPath";
import DsIcon from "components/DsIcon";

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
        to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project?.name ?? "")}/configuration`}
      >
        project configuration
        <DsIcon className="external-link-icon" icon="external-link" />
      </Link>
    </>
  );
};

export default SnapshotDisabledWarningLink;
