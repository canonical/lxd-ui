import type { FC } from "react";
import { Link } from "react-router-dom";

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const BreadcrumbPath: FC<Props> = ({ currentPath, onNavigate }) => {
  const segments = currentPath.split("/").filter(Boolean);

  const breadcrumbs = [
    {
      label: "root",
      path: "/",
    },
    ...segments.map((segment, index) => ({
      label: segment,
      path: segments.slice(0, index + 1).join("/"),
    })),
  ];

  return (
    <nav
      className="p-breadcrumbs p-breadcrumbs--large"
      aria-label="File Explorer Path"
    >
      <ol className="p-breadcrumbs__items breadcrumb-wrapper">
        <li className="p-heading--4 breadcrumb-header">Directory:&nbsp; </li>
        {breadcrumbs.map((crumb, index) => {
          const currentDirectory = index === breadcrumbs.length - 1;

          return (
            <li key={crumb.path} className="p-heading--4 continuous-breadcrumb">
              {currentDirectory ? (
                // Current directory - not clickable
                <span>{crumb.label}</span>
              ) : (
                // Parent directories - clickable
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(crumb.path);
                  }}
                >
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

export default BreadcrumbPath;
