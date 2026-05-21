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
import InstanceFileExplorerItem from "pages/instances/InstanceFileExplorerItem";
import { fetchInstanceFile } from "api/instances";

interface Props {
  instance: LxdInstance;
}

const InstanceFileExplorer: FC<Props> = ({ instance }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [tree, setTree] = useState(new Map());
  const [currentPath, setCurrentPath] = useState("/");

  const loadInstancePath = async (path: string) => {
    const result = await fetchInstanceFile(
      instance.name,
      instance.project,
      path,
    ).catch((e) => {
      setIsLoading(false);
      console.log(e);
    });
    const newMap = new Map(...tree);
    newMap[path] = result.metadata;
    setTree(newMap);
    setCurrentPath(path);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement SFTP connection
      console.log("Connecting to SFTP for instance:", instance.name);
      loadInstancePath("/");

      // Placeholder for testing
      setTimeout(() => {
        setIsConnected(true);
        setIsLoading(false);
      }, 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect");
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
        <h2 className="p-panel__title">Files</h2>
      </div>
      <div className="p-panel__content">
        <p>File listing will appear here (protocol research needed)</p>
        <p>Current path: {currentPath}</p>
        {tree[currentPath]?.map((item) => (
          <InstanceFileExplorerItem
            key={item}
            instance={instance}
            onClick={() => loadInstancePath(currentPath + "/" + item)}
            currentPath={currentPath}
            fileOrFolderName={item}
          />
        ))}
      </div>
    </div>
  );
};

export default InstanceFileExplorer;
