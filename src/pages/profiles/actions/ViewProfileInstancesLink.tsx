import type { FC } from "react";
import { Link } from "react-router-dom";
import { getInstancesUrl } from "util/projects";

interface Props {
  profile: string;
  project: string;
}

const ViewProfileInstancesLink: FC<Props> = ({ profile, project }) => {
  const href = `${getInstancesUrl(project)}?profile=${encodeURIComponent(profile)}`;

  return (
    <Link className="u-no-margin u-no-padding" to={href}>
      Go to instances
    </Link>
  );
};

export default ViewProfileInstancesLink;
