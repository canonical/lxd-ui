import React, { FC } from "react";
import { MainTable } from "@canonical/react-components";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

interface Props {
  rows: MainTableRow[];
}

const OverrideTable: FC<Props> = ({ rows }) => {
  const headers = [
    { content: "Override", className: "override" },
    { content: "Configuration", className: "config" },
    { content: "Value", className: "value" },
    { content: "Defined in", className: "defined" },
  ];

  return (
    <MainTable
      className="u-table-layout--fixed override-table"
      headers={headers}
      rows={rows}
    />
  );
};

export default OverrideTable;
