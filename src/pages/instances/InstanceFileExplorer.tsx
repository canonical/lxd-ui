import type { FC } from "react";
import { useEffect, useState } from "react";
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
import { fetchInstanceFile } from "api/instances";

interface Props {
  instance: LxdInstance;
}

const InstanceFileExplorer: FC<Props> = ({ instance }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tree, setTree] = useState(new Map<string, string[]>());
  const [currentPath, setCurrentPath] = useState("/");

  useEffect(() => {
    if (isInstanceRunning(instance)) {
      try {
        void loadInstancePath("/");
      } catch (e) {
        console.error("Failed to load initial path:", e);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const loadInstancePath = async (path: string) => {
    const currentDirectory = await fetchInstanceFile(
      instance.name,
      instance.project,
      path,
    );
    if (!currentDirectory) return false;

    setTree((prev) => {
      const newMap = new Map(prev);
      newMap.set(path, currentDirectory.metadata);
      return newMap;
    });
    setCurrentPath(path);
    return true;
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Connecting to instance:", instance.name);
      const hasLoadedPath = await loadInstancePath("/");

      if (!hasLoadedPath) {
        setError("Failed to load initial path");
        return;
      }
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

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading file system..." />;
  }

  return (
    <Row className="general">
      <h2 className="p-panel__title">Path {currentPath}</h2>
      <FileExplorerTable
        files={(tree.get(currentPath) as string[]) ?? []}
        currentPath={currentPath}
        instanceName={instance.name}
        projectName={instance.project}
        onNavigate={(newPath) => {
          void loadInstancePath(newPath);
        }}
      />
    </Row>
  );
};

export default InstanceFileExplorer;
