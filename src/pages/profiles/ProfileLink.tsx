import React, { FC } from "react";
import { Link } from "react-router-dom";
import ItemName from "components/ItemName";

interface Props {
  profile: {
    name: string;
    project: string;
  };
}

const ProfileLink: FC<Props> = ({ profile }) => {
  return (
    <Link to={`/ui/${profile.project}/profiles/detail/${profile.name}`}>
      <ItemName item={profile} />
    </Link>
  );
};

export default ProfileLink;
