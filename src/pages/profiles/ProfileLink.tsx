import type { FC } from "react";
import { Link } from "react-router-dom";
import ItemName from "components/ItemName";
import type { LxdProfile } from "types/profile";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  profile: LxdProfile;
}

const ProfileLink: FC<Props> = ({ profile }) => {
  return (
    <Link
      to={`${ROOT_PATH}/ui/project/${encodeURIComponent(profile?.project ?? "default")}/profile/${encodeURIComponent(profile.name)}`}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <ItemName item={profile} />
    </Link>
  );
};

export default ProfileLink;
