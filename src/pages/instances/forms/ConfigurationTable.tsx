import React, { FC, ReactNode } from "react";
import { MainTable, useNotify } from "@canonical/react-components";
import {
  MainTableCell,
  MainTableHeader,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import ScrollableTable from "components/ScrollableTable";

interface Props {
  formik: SharedFormikTypes;
  rows: MainTableRow[];
  configurationExtra?: ReactNode;
  emptyStateMsg?: string;
}

const ConfigurationTable: FC<Props> = ({
  formik,
  rows,
  configurationExtra,
  emptyStateMsg,
}) => {
  const notify = useNotify();
  const isReadOnly = formik.values.readOnly;

  const hasOverrideClass = (item: MainTableHeader | MainTableCell) =>
    item.className !== "override";

  const filterHeaders = (headers: MainTableHeader[]): MainTableHeader[] => {
    return isReadOnly ? headers.filter(hasOverrideClass) : headers;
  };

  const filterRows = (rows: MainTableRow[]): MainTableRow[] => {
    return isReadOnly
      ? rows.map((row) => {
          const filteredColumns = row.columns?.filter(hasOverrideClass);
          return { ...row, columns: filteredColumns };
        })
      : rows;
  };

  const headers = [
    {
      content: "",
      className: "override",
    },
    { content: <>Configuration{configurationExtra}</>, className: "config" },
    { content: "Inherited", className: "value" },
    { content: "Override", className: "defined" },
  ];

  return (
    <ScrollableTable dependencies={[notify.notification]} belowId="form-footer">
      <MainTable
        className="configuration-table"
        emptyStateMsg={emptyStateMsg}
        headers={filterHeaders(headers)}
        rows={filterRows(rows)}
      />
    </ScrollableTable>
  );
};

export default ConfigurationTable;
