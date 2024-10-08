import { FC } from "react";
import { getResourceOptionColumns } from "util/permissions";

interface Props {
  resourceType: string;
}

const ResourceOptionHeader: FC<Props> = ({ resourceType }) => {
  const columns = getResourceOptionColumns(resourceType);

  if (columns.length < 2) {
    return null;
  }

  const headerSegments = columns.map((column) => {
    return (
      <span key={column} className="resource u-no-margin--bottom">
        {column === "imageType" ? "image type" : column}
      </span>
    );
  });

  return <div className="header">{headerSegments}</div>;
};

export default ResourceOptionHeader;
