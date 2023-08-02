import React, { FC, ReactNode } from "react";
import { MainTable, useNotify } from "@canonical/react-components";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import ScrollableTable from "components/ScrollableTable";

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
  const notify = useNotify();

  const headers = [
    {
      content: <>Configuration{configurationExtra}</>,
      className: "configuration",
    },
    { content: "Inherited", className: "inherited" },
    { content: "Override", className: "override" },
  ];

  return (
    <ScrollableTable dependencies={[notify.notification]} belowId="form-footer">
      <MainTable
        className="configuration-table"
        emptyStateMsg={emptyStateMsg}
        headers={headers}
        rows={rows}
      />
    </ScrollableTable>
  );
};

export default ConfigurationTable;
