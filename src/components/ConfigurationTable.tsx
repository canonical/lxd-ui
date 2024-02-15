import { FC, ReactNode } from "react";
import { MainTable, MainTableProps } from "@canonical/react-components";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

interface Props {
  rows: MainTableRow[];
  configurationExtra?: ReactNode;
  emptyStateMsg?: string;
}

const ConfigurationTable: FC<Props & MainTableProps> = ({
  rows,
  configurationExtra,
  emptyStateMsg,
  ...props
}) => {
  const headers = [
    {
      content: <span>Configuration{configurationExtra}</span>,
      className: "configuration",
    },
    { content: <span>Inherited</span>, className: "inherited" },
    { content: <span>Override</span>, className: "override" },
  ];

  return (
    <MainTable
      className="configuration-table"
      emptyStateMsg={emptyStateMsg}
      headers={headers}
      rows={rows}
      {...props}
    />
  );
};

export default ConfigurationTable;
