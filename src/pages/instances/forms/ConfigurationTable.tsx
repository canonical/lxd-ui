import React, { FC, ReactNode, useState } from "react";
import { MainTable, useNotify } from "@canonical/react-components";
import {
  MainTableCell,
  MainTableHeader,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import { figureCollapsedScreen } from "util/formFields";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import useEventListener from "@use-it/event-listener";
import ScrollableTable from "components/ScrollableTable";

interface Props {
  formik: SharedFormikTypes;
  rows: MainTableRow[];
  configurationExtra?: ReactNode;
  emptyStateMsg?: string;
  isCollapsedOverride?: boolean;
}

const ConfigurationTable: FC<Props> = ({
  formik,
  rows,
  configurationExtra,
  emptyStateMsg,
  isCollapsedOverride,
}) => {
  const notify = useNotify();
  const [isSmallScreen, setSmallScreen] = useState(figureCollapsedScreen());
  const isCollapsedView = isSmallScreen || isCollapsedOverride;

  const resize = () => {
    setSmallScreen(figureCollapsedScreen());
  };
  useEventListener("resize", resize);

  const isReadOnly = formik.values.readOnly;

  const hasOverrideClass = (item: MainTableHeader | MainTableCell) =>
    item.className !== "override";

  const filterHeaders = (headers: MainTableHeader[]): MainTableHeader[] => {
    const prefiltered = isCollapsedView
      ? headers.filter((header) => header.className !== "value")
      : headers;
    return isReadOnly ? prefiltered.filter(hasOverrideClass) : prefiltered;
  };

  const filterRows = (rows: MainTableRow[]): MainTableRow[] => {
    return isReadOnly
      ? rows.map((row) => {
          const filteredColumns = row.columns?.filter(hasOverrideClass);
          return { ...row, columns: filteredColumns };
        })
      : rows;
  };

  const collapseRows = (rows: MainTableRow[]): MainTableRow[] => {
    return isCollapsedView
      ? rows.map((row) => {
          const collapsedColumns = [
            row.columns?.find((col) => col.className === "override") ?? {},
            {
              content: (
                <>
                  <div>
                    {row.columns?.find((col) => col.className === "config")
                      ?.content ?? ""}
                  </div>
                  {row.columns?.find((col) => col.className === "value")
                    ?.content ?? ""}
                </>
              ),
              className: "config",
            },
            row.columns?.find((col) => col.className === "defined") ?? {},
          ];
          return { ...row, columns: collapsedColumns };
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
        rows={filterRows(collapseRows(rows))}
      />
    </ScrollableTable>
  );
};

export default ConfigurationTable;
