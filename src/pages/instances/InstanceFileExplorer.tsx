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
import UploadFileExplorerBtn from "./UploadFileExplorerBtn";
import FileExplorerCreateBtn from "./FileExplorerCreateBtn";
import { fetchInstanceDirectory } from "api/instances";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import StartInstanceBtn from "./actions/StartInstanceBtn";
import NotificationRow from "components/NotificationRow";

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
        <StartInstanceBtn
          instance={instance}
          appearance="positive"
          dense={false}
          iconClassname="is-light"
          hasLabel
          showBooting
        />
      </EmptyState>
    );
  }

  return (
    <Row className="general">
      <div className="upper-controls-bar">
        <div className="search-box-wrapper">
          <FileExplorerBreadcrumb
            currentPath={currentPath}
            instance={instance}
          />
        </div>
        <div>
          <FileExplorerCreateBtn
            instance={instance}
            currentPath={currentPath}
            refreshDirectoryList={invalidateCache}
          />
          <UploadFileExplorerBtn
            instance={instance}
            currentPath={currentPath}
            refreshDirectoryList={invalidateCache}
            directoryContent={directoryContent?.metadata ?? []}
          />
        </div>
      </div>
      <NotificationRow />
      {error ? (
        <>
          <Notification
            severity="negative"
            title="Error connecting to file system"
            className="u-no-margin--bottom"
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
      ) : isLoading ? (
        <Spinner className="u-loader" text="Loading file system..." />
      ) : (
        <FileExplorerTable
          key={directoryContent?.metadata.length}
          files={directoryContent?.metadata ?? []}
          currentPath={currentPath}
          instance={instance}
        />
      )}
    </Row>
  );
};

export default InstanceFileExplorer;
