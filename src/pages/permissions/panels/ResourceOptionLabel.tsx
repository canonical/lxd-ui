import { FC } from "react";
import { ResourceDetail } from "util/resourceDetails";
import { resourceOptionColumns } from "util/permissions";

interface Props {
  resource: ResourceDetail;
}

const ResourceOptionLabel: FC<Props> = ({ resource }) => {
  const columns =
    resourceOptionColumns[resource.type] || resourceOptionColumns.default;

  const labelSegments = columns.map((column) => {
    let value = resource[column] || "-";
    if (Array.isArray(value)) {
      value = value.join(", ") || "-";
    }

    return (
      <span
        key={`${column}-${value}`}
        title={value}
        className="resource u-truncate"
      >
        {value}
      </span>
    );
  });

  return <div className="label">{labelSegments}</div>;
};

export default ResourceOptionLabel;
