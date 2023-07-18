import React, { FC } from "react";
import {
  Button,
  ContextualMenu,
  Icon,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNavigate } from "react-router-dom";
import { defaultFirst } from "util/helpers";
import { fetchClusterGroups } from "api/cluster";
import ClusterGroupSelectorList from "pages/cluster/ClusterGroupSelectorList";

interface Props {
  activeGroup?: string;
}

const ClusterGroupSelector: FC<Props> = ({ activeGroup }): JSX.Element => {
  const navigate = useNavigate();
  const notify = useNotify();

  const { data: clusterGroups = [], error } = useQuery({
    queryKey: [queryKeys.cluster, queryKeys.groups],
    queryFn: fetchClusterGroups,
  });

  if (error) {
    notify.failure("Loading cluster groups failed", error);
  }

  clusterGroups.sort(defaultFirst);

  return (
    <ContextualMenu
      dropdownProps={{ "aria-label": "select cluster group" }}
      toggleClassName="toggle"
      position="left"
      toggleLabel={activeGroup}
      toggleAppearance="base"
      className="u-no-margin--bottom cluster-group-select"
      hasToggleIcon
      title={"Select group"}
    >
      <div className="cluster-group-list" key="my-div">
        <ClusterGroupSelectorList clusterGroups={clusterGroups} />
        <hr />
        <Button
          onClick={() => navigate("/ui/cluster/groups/create")}
          className="p-contextual-menu__link"
          hasIcon
        >
          <Icon name="plus" />
          <span>Create group</span>
        </Button>
      </div>
    </ContextualMenu>
  );
};

export default ClusterGroupSelector;
