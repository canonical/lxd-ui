import React, { FC } from "react";
import { Link } from "react-router-dom";
import { LxdClusterGroup } from "types/cluster";
import { allClusterGroups } from "util/clusterGroups";

interface Props {
  clusterGroups: LxdClusterGroup[];
}

const ClusterGroupSelectorList: FC<Props> = ({ clusterGroups }) => {
  const allMembers = new Set(clusterGroups.flatMap((group) => group.members));

  return (
    <div>
      {[
        {
          name: allClusterGroups,
          members: [...allMembers],
          description: "Members from all cluster groups",
        },
        ...clusterGroups,
      ].map((group) => (
        <div
          key={group.name}
          className="p-contextual-menu__group cluster-group"
        >
          <Link
            to={
              group.name === allClusterGroups
                ? "/ui/cluster"
                : `/ui/cluster/groups/detail/${group.name}`
            }
            className="p-contextual-menu__link link"
          >
            <div title={group.name} className="u-truncate name">
              {group.name}
            </div>
            <div className="p-text--x-small u-float-right u-no-margin--bottom count">
              {group.members.length}{" "}
              {group.members.length === 1 ? "member" : "members"}
            </div>
            <br />
            <div
              className="p-text--x-small u-no-margin--bottom u-truncate description"
              title={group.description}
            >
              {group.description || "-"}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ClusterGroupSelectorList;
