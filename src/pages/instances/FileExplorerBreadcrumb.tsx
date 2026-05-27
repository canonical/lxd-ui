import type { FC } from "react";
import { Link } from "react-router-dom";
import type { LxdInstance } from "types/instance";
import { getFileExplorerDirectoryURL } from "util/instances";

interface Props {
  currentPath: string;
  instance: LxdInstance;
}

const FileExplorerBreadcrumb: FC<Props> = ({ currentPath, instance }) => {
  const segments = currentPath.split("/").filter(Boolean);

  const breadcrumbs = [
    {
      label: "root",
      path: "/",
    },
    ...segments.map((segment, index) => ({
      label: segment,
      path: "/" + segments.slice(0, index + 1).join("/"),
    })),
  ];
  return (
    <nav
      className="p-breadcrumbs p-breadcrumbs--large"
      aria-label="File Explorer Path"
    >
      <ol className="p-breadcrumbs__items breadcrumb-wrapper">
        <li className="p-heading--4 breadcrumb-header">Directory:&nbsp;</li>
        {breadcrumbs.map((crumb, index) => {
          const isCurrentDirectory = index === breadcrumbs.length - 1;

          return (
            <li key={crumb.path} className="p-heading--4 continuous-breadcrumb">
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
      </ol>
    </nav>
  );
};

export default FileExplorerBreadcrumb;
