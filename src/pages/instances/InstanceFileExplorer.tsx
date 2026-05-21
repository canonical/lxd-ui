import type { FC } from "react";
import { useState } from "react";
import {
  Button,
  EmptyState,
  Icon,
  Notification,
  Spinner,
} from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { isInstanceRunning } from "util/instanceStatus";
import { fetchInstanceFile } from "util/instanceFileExplorer";
import FileExplorerTable from "./FileExplorerTable";

interface Props {
  instance: LxdInstance;
}

const InstanceFileExplorer: FC<Props> = ({ instance }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [tree, setTree] = useState(new Map<string, string[]>());
  const [currentPath, setCurrentPath] = useState("/");

  const loadInstancePath = async (path: string) => {
    const fileExplorerItem = await fetchInstanceFile(
      instance.name,
      instance.project,
      path,
    );
    if (!fileExplorerItem) return false;

    setTree((prev) => {
      const newMap = new Map(prev);
      newMap.set(path, fileExplorerItem.metadata);
      return newMap;
    });
    setCurrentPath(path);
    return true;
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    setIsConnected(false);

    try {
      console.log("Connecting to SFTP for instance:", instance.name);
      const hasLoadedPath = await loadInstancePath("/");

      if (!hasLoadedPath) {
        setError("Failed to load initial path");
        return;
      }
      setIsConnected(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInstanceRunning(instance)) {
    return (
      <EmptyState
        className="empty-state"
        image={<Icon name="containers" className="empty-state-icon" />}
        title="Instance is not running"
      >
        <p>The instance must be running to browse files.</p>
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
          onDismiss={() => {
            setError(null);
          }}
        >
          {error}
        </Notification>
        <div className="p-panel">
          <div className="p-panel__content">
            <Button appearance="positive" onClick={handleConnect}>
              Retry connection
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (!isConnected) {
    return (
      <EmptyState
        className="empty-state"
        image={<Icon name="folder" className="empty-state-icon" />}
        title="File explorer"
      >
        <p>Browse and manage files in this instance.</p>
        <Button
          appearance="positive"
          onClick={handleConnect}
          disabled={isLoading}
        >
          {isLoading ? "Connecting..." : "Connect to file system"}
        </Button>
      </EmptyState>
    );
  }

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading file system..." />;
  }

  return (
    <div className="p-panel">
      <div className="p-panel__header">
        <h2 className="p-panel__title">Path - {currentPath}</h2>
      </div>
      <div className="p-panel__content">
        <FileExplorerTable
          files={(tree.get(currentPath) as string[]) ?? []}
          currentPath={currentPath}
          instanceName={instance.name}
          projectName={instance.project}
          onNavigate={(newPath) => {
            void loadInstancePath(newPath);
          }}
        />
      </div>
    </div>
  );
};

export default InstanceFileExplorer;
