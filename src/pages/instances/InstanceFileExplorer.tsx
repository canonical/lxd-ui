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
import BreadcrumbPath from "./BreadcrumbPath";
import { fetchInstanceFile } from "api/instances";
import { useSearchParams } from "react-router-dom";

interface Props {
  instance: LxdInstance;
}

const InstanceFileExplorer: FC<Props> = ({ instance }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tree, setTree] = useState(new Map<string, string[]>());
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPath = searchParams.get("path") || "/";

  useEffect(() => {
    if (isInstanceRunning(instance) && !tree.has(currentPath)) {
      void loadInstancePath(currentPath);
    }
  }, [currentPath]);

  const loadInstancePath = async (path: string) => {
    setIsLoading(true);
    setError(null);

    try {
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

      setSearchParams({ path });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load path");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    const hasLoadedPath = await loadInstancePath("/");
    if (!hasLoadedPath) {
      setError((prev) => prev ?? "Failed to load initial path");
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
      <BreadcrumbPath
        currentPath={currentPath}
        onNavigate={(path) => {
          void loadInstancePath(path);
        }}
      />
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
