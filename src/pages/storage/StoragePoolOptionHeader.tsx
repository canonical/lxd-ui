import type { FC } from "react";
const StoragePoolOptionHeader: FC = () => {
  const columns = ["name", "driver", "usage"];

  if (columns.length < 2) {
    return null;
  }

  const headerSegments = columns.map((column) => {
    return (
      <span key={column} className="resource u-no-margin--bottom">
        {column}
      </span>
    );
  });

  return <div className="header">{headerSegments}</div>;
};

export default StoragePoolOptionHeader;
