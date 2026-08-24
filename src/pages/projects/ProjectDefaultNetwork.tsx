import type { FC } from "react";
import { Link } from "react-router-dom";
import { Spinner } from "@canonical/react-components";
import { useProfile } from "context/useProfiles";
import { getDefaultNetwork } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  project: string;
}

const ProjectDefaultNetwork: FC<Props> = ({ project }) => {
  const { data: profile, isLoading } = useProfile("default", project);
  const network = profile && getDefaultNetwork(profile);

  if (isLoading) {
    return <Spinner />;
  }

  return network === "none" || !network ? (
    <>-</>
  ) : (
    <Link
      to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network)}`}
      className="u-truncate"
      title={network}
    >
      {network}
    </Link>
  );
};

export default ProjectDefaultNetwork;
