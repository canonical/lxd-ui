import {
  type FC,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Icon, useNotify } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { getFileExplorerDirectoryURL } from "util/instances";
import { fetchInstanceDirectory } from "api/instances";

interface Props {
  currentPath: string;
  instance: LxdInstance;
}

const validatePathSyntax = (path: string): string | null => {
  if (!path.startsWith("/")) {
    return "Path must be absolute (start with /).";
  }

  const segments = path.split("/").filter(Boolean);
  for (const segment of segments) {
    if (segment === "." || segment === "..") {
      return "Relative path segments (. and ..) are not allowed.";
    }
  }

  return null;
};

const FileExplorerBreadcrumb: FC<Props> = ({ currentPath, instance }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [path, setPath] = useState(currentPath);
  const [isNavigating, setIsNavigating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const notify = useNotify();

  useEffect(() => {
    setPath(currentPath);
    setIsEditing(false);
  }, [currentPath]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNavigate = async () => {
    const trimmedPath = path.trim();

    if (trimmedPath === currentPath) {
      setIsEditing(false);
      return;
    }

    const syntaxError = validatePathSyntax(trimmedPath);
    if (syntaxError) {
      notify.failure("Invalid path", new Error(syntaxError));
      return;
    }

    setIsNavigating(true);
    try {
      await fetchInstanceDirectory(
        instance.name,
        instance.project,
        trimmedPath,
      );
      notify.clear();
      navigate(getFileExplorerDirectoryURL(trimmedPath, instance));
    } catch (error) {
      notify.failure("Path not found", error);
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
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="file-explorer-breadcrumb-bar">
        <input
          ref={inputRef}
          type="text"
          className="p-form-control file-explorer-path-input"
          placeholder="Search path..."
          aria-label="Search path"
          value={path}
          onChange={(e) => {
            setPath(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          disabled={isNavigating}
        />
        <Button
          appearance="base"
          className="file-explorer-go-btn u-no-margin--bottom"
          onClick={() => void handleNavigate()}
          aria-label="Go to path"
          disabled={isNavigating}
          hasIcon
        >
          <Icon name="chevron-right" />
        </Button>
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
          <li className="file-explorer-edit-btn-wrapper">
            <Button
              appearance="base"
              className="file-explorer-edit-btn u-no-margin--bottom"
              onClick={() => {
                setIsEditing(true);
              }}
              aria-label="Edit path"
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
