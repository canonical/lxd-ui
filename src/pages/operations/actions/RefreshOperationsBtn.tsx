import { useEffect, type FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ActionButton, Icon } from "@canonical/react-components";
import classnames from "classnames";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useOperationsWithChildren } from "context/operationsProvider";
import { queryKeys } from "util/queryKeys";

const RefreshOperationsBtn: FC = () => {
  const { isFetching } = useOperationsWithChildren();
  const queryClient = useQueryClient();
  const isSmallScreen = useIsScreenBelow();

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === queryKeys.operations,
    });
  };

  // force a refresh on first render
  useEffect(handleRefresh, []);

  return (
    <ActionButton
      className={classnames("u-no-margin--bottom", {
        "has-icon": !isSmallScreen,
      })}
      onClick={handleRefresh}
      loading={isFetching}
      disabled={isFetching}
    >
      {!isSmallScreen && <Icon name="restart" />}
      <span>Refresh</span>
    </ActionButton>
  );
};

export default RefreshOperationsBtn;
