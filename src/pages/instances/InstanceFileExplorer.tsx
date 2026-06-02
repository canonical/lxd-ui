import { useEffect, useState, type FC } from "react";
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

interface Props {
  instance: LxdInstance;
}

const InstanceFileExplorer: FC<Props> = ({ instance }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tree, setTree] = useState(new Map<string, string[]>());
  const [searchParams] = useSearchParams();
  const currentPath = searchParams.get("path") || "/";
  const canServeFiles =
    isInstanceRunning(instance) || instance.type === "container";

  useEffect(() => {
    if (canServeFiles && !tree.has(currentPath)) {
      void loadInstancePath(currentPath);
    }
  }, [canServeFiles, currentPath]);

  const loadInstancePath = async (path: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentDirectory = await fetchInstanceDirectory(
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load path");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    await loadInstancePath(currentPath);
  };

  const refreshCurrentPath = () => {
    setTree((prev) => {
      const newMap = new Map(prev);
      newMap.delete(currentPath);
      return newMap;
    });
    void loadInstancePath(currentPath);
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
      <FileExplorerBreadcrumb currentPath={currentPath} instance={instance} />
      <FileExplorerTable
        files={(tree.get(currentPath) as string[]) ?? []}
        currentPath={currentPath}
        instance={instance}
        onDeleteSuccess={refreshCurrentPath}
      />
    </Row>
  );
};

export default InstanceFileExplorer;
