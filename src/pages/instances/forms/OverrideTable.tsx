import React, { FC, ReactNode } from "react";
import { MainTable } from "@canonical/react-components";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

interface Props {
  rows: MainTableRow[];
  configurationExtra?: ReactNode;
}

const OverrideTable: FC<Props> = ({ rows, configurationExtra }) => {
  const headers = [
    { content: "Override", className: "override" },
    { content: <>Configuration{configurationExtra}</>, className: "config" },
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
