import { type FC, type KeyboardEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Icon, Input } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import {
  getFileExplorerDirectoryURL,
  validateDirectoryPathSyntax,
} from "util/instances";
import { fetchInstanceDirectory } from "api/instances";

interface Props {
  currentPath: string;
  instance: LxdInstance;
}

const FileExplorerBreadcrumb: FC<Props> = ({ currentPath, instance }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [path, setPath] = useState(currentPath);
  const [isNavigating, setIsNavigating] = useState(false);
  const [inputError, setInputError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    setPath(currentPath);
    setInputError(undefined);
    setIsEditing(false);
  }, [currentPath]);

  const handleNavigate = async () => {
    const trimmedPath = path.trim();

    if (trimmedPath === currentPath) {
      setInputError(undefined);
      setIsEditing(false);
      return;
    }

    const syntaxError = validateDirectoryPathSyntax(trimmedPath);
    setInputError(syntaxError);
    if (syntaxError) {
      return;
    }

    setIsNavigating(true);
    try {
      await fetchInstanceDirectory(
        instance.name,
        instance.project,
        trimmedPath,
      );
      navigate(getFileExplorerDirectoryURL(trimmedPath, instance));
    } catch (error) {
      setInputError(
        "Invalid path: " +
          (error instanceof Error ? error.message : String(error)),
      );
    } finally {
      setIsNavigating(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void handleNavigate();
    }
    if (e.key === "Escape") {
      setPath(currentPath);
      setInputError(undefined);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="file-explorer-path-editor">
        <Input
          type="text"
          className="file-explorer-path-input"
          aria-label="Search path"
          value={path}
          onChange={(e) => {
            setPath(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          disabled={isNavigating}
          error={inputError}
          autoFocus
        />
        <div>
          <Button
            appearance="base"
            onClick={() => void handleNavigate()}
            aria-label="Go to path"
            disabled={isNavigating}
            hasIcon
          >
            <Icon name="search" />
          </Button>
        </div>
      </div>
    );
  }

  const segments = currentPath.split("/").filter(Boolean);
  const breadcrumbs = [
    { label: "root", path: "/" },
    ...segments.map((segment, index) => ({
      label: segment,
      path: "/" + segments.slice(0, index + 1).join("/"),
    })),
  ];

  return (
    <div className="file-explorer-breadcrumb-bar">
      <nav
        className="p-breadcrumbs p-breadcrumbs--large"
        aria-label="File Explorer Path"
      >
        <ol className="p-breadcrumbs__items breadcrumb-wrapper">
          <li className="p-heading--5 breadcrumb-header">Directory:&nbsp;</li>
          {breadcrumbs.map((crumb, index) => {
            const isCurrentDirectory = index === breadcrumbs.length - 1;

            return (
              <li
                key={crumb.path}
                className="p-heading--5 continuous-breadcrumb"
              >
                {isCurrentDirectory ? (
                  <span>{crumb.label}</span>
                ) : (
                  <Link to={getFileExplorerDirectoryURL(crumb.path, instance)}>
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
          <li>
            <Button
              appearance="base"
              className="u-no-margin--bottom"
              onClick={() => {
                setPath(currentPath);
                setIsEditing(true);
              }}
              title="Search path"
              aria-label="Search path"
              hasIcon
            >
              <Icon name="search" />
            </Button>
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default FileExplorerBreadcrumb;
