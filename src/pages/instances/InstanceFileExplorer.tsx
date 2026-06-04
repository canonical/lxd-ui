import { type FC } from "react";
import {
  Button,
  EmptyState,
  Icon,
  Notification,
  Row,
  Spinner,
} from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { isInstanceRunning } from "util/instanceStatus";
import FileExplorerTable from "./FileExplorerTable";
import FileExplorerBreadcrumb from "./FileExplorerBreadcrumb";
import { fetchInstanceDirectory } from "api/instances";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";

interface Props {
  instance: LxdInstance;
}

const InstanceFileExplorer: FC<Props> = ({ instance }) => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const currentPath = searchParams.get("path") || "/";
  const canServeFiles =
    isInstanceRunning(instance) || instance.type === "container";

  const {
    data: directoryContent,
    error,
    isLoading,
  } = useQuery({
    queryKey: [
      queryKeys.instances,
      instance.name,
      instance.project,
      queryKeys.files,
      currentPath,
    ],
    queryFn: async () =>
      fetchInstanceDirectory(instance.name, instance.project, currentPath),
    enabled: canServeFiles,
  });

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: [
        queryKeys.instances,
        instance.name,
        instance.project,
        queryKeys.files,
        currentPath,
      ],
    });
  };

  if (!canServeFiles) {
    return (
      <EmptyState
        className="empty-state"
        image={<Icon name="containers" className="empty-state-icon" />}
        title="Instance is not running"
      >
        <p>Virtual machines must be running to browse files.</p>
        <p>
          <a
            href={`https://documentation.ubuntu.com/lxd/en/latest/howto/instances_manage/`}
            rel="noopener noreferrer"
            target="_blank"
          >
            Learn more about managing instances
            <Icon className="external-link-icon" name="external-link" />
          </a>
        </p>
      </EmptyState>
    );
  }

  if (error) {
    return (
      <>
        <Notification
          severity="negative"
          title="Error connecting to file system"
        >
          {error.message}
        </Notification>
        <div className="p-panel">
          <div className="p-panel__content">
            <Button appearance="positive" onClick={invalidateCache}>
              Retry connection
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading file system..." />;
  }

  return (
    <Row className="general">
      <FileExplorerBreadcrumb currentPath={currentPath} instance={instance} />
      <FileExplorerTable
        key={directoryContent?.metadata.length}
        files={directoryContent?.metadata ?? []}
        currentPath={currentPath}
        instance={instance}
      />
    </Row>
  );
};

export default InstanceFileExplorer;
