import React, { FC, ReactNode } from "react";
import { MainTable } from "@canonical/react-components";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

interface Props {
  rows: MainTableRow[];
  configurationExtra?: ReactNode;
  emptyStateMsg?: string;
}

const ConfigurationTable: FC<Props> = ({
  rows,
  configurationExtra,
  emptyStateMsg,
}) => {
  const headers = [
    {
      content: <>Configuration{configurationExtra}</>,
      className: "configuration",
    },
    { content: "Inherited", className: "inherited" },
    { content: "Override", className: "override" },
  ];

  return (
    <MainTable
      className="configuration-table"
      emptyStateMsg={emptyStateMsg}
      headers={headers}
      rows={rows}
    />
  );
};

export default ConfigurationTable;
