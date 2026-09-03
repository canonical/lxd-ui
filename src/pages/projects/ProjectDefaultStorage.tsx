import type { FC } from "react";
import { Link } from "react-router-dom";
import { Spinner } from "@canonical/react-components";
import { useProfile } from "context/useProfiles";
import { getDefaultStoragePool } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  project: string;
}

const ProjectDefaultStorage: FC<Props> = ({ project }) => {
  const { data: profile, isLoading } = useProfile("default", project);
  const storagePool = profile && getDefaultStoragePool(profile);

  if (isLoading) {
    return <Spinner />;
  }

  return storagePool ? (
    <Link
      to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/pool/${encodeURIComponent(storagePool)}`}
      className="u-truncate"
      title={storagePool}
    >
      {storagePool}
    </Link>
  ) : (
    <>-</>
  );
};

export default ProjectDefaultStorage;
