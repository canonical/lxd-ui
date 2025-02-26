import type { FC } from "react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { ActionButton, Icon } from "@canonical/react-components";
import { useOperations } from "context/operationsProvider";

const RefreshOperationsBtn: FC = () => {
  const { isFetching } = useOperations();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: [queryKeys.operations] });
  };

  // force a refresh on first render
  useEffect(handleRefresh, []);

  return (
    <ActionButton
      className="u-no-margin--bottom has-icon"
      onClick={handleRefresh}
      loading={isFetching}
    >
      <Icon name="restart" />
      <span>Refresh</span>
    </ActionButton>
  );
};

export default RefreshOperationsBtn;
