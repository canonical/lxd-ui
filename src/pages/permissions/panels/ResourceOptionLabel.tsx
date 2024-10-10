import { FC } from "react";
import { ResourceDetail } from "util/resourceDetails";
import { getResourceOptionColumns } from "util/permissions";

interface Props {
  resource: ResourceDetail;
}

const ResourceOptionLabel: FC<Props> = ({ resource }) => {
  const columns = getResourceOptionColumns(resource.type);

  const labelSegments = columns.map((column) => {
    let value = resource[column] || "-";
    if (Array.isArray(value)) {
      value = value.join(", ") || "-";
    }

    return (
      <span key={column} title={value} className="resource u-truncate">
        {value}
      </span>
    );
  });

  return <div className="label">{labelSegments}</div>;
};

export default ResourceOptionLabel;
