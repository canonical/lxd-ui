import type { FC } from "react";
import { Link } from "react-router-dom";
import ItemName from "components/ItemName";
import type { LxdProfile } from "types/profile";

interface Props {
  profile: LxdProfile;
}

const ProfileLink: FC<Props> = ({ profile }) => {
  return (
    <Link
      to={`/ui/project/${encodeURIComponent(profile?.project ?? "default")}/profile/${encodeURIComponent(profile.name)}`}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <ItemName item={profile} />
    </Link>
  );
};

export default ProfileLink;
