import type { FC } from "react";
import { Link } from "react-router-dom";

interface Props {
  profile: string;
  project: string;
}

const ViewProfileInstancesLink: FC<Props> = ({ profile, project }) => {
  const href = `/ui/project/${encodeURIComponent(project)}/instances?profile=${encodeURIComponent(profile)}`;

  return (
    <Link className="u-no-margin u-no-padding" to={href}>
      Go to instances
    </Link>
  );
};

export default ViewProfileInstancesLink;
