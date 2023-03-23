import React, { FC, ReactNode } from "react";
import { Icon, MainTable, Tooltip } from "@canonical/react-components";
import {
  MainTableCell,
  MainTableHeader,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import { collapsedViewMaxWidth } from "util/formFields";
import useMediaQuery from "context/mediaQuery";
import { SharedFormikTypes } from "pages/instances/forms/sharedFormTypes";
import { EditInstanceFormValues } from "pages/instances/EditInstanceForm";

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
  const isCollapsedView = useMediaQuery(
    `(max-width: ${collapsedViewMaxWidth}px)`
  );

  const isReadOnly = (formik.values as EditInstanceFormValues).readOnly;

  const hasOverrideClass = (item: MainTableHeader | MainTableCell) =>
    item.className !== "override";

  const filterHeaders = (headers: MainTableHeader[]): MainTableHeader[] => {
    return isReadOnly ? headers.filter(hasOverrideClass) : headers;
  };

  const filterRows = (rows: MainTableRow[]): MainTableRow[] => {
    return isReadOnly
      ? rows.map((row) => {
          row.columns = row.columns?.filter(hasOverrideClass);
          return row;
        })
      : rows;
  };

  const collapseRows = (rows: MainTableRow[]): MainTableRow[] => {
    return isCollapsedView
      ? rows.map((row) => {
          row.columns = [
            row.columns?.find((col) => col.className === "override") ?? {},
            {
              content: (
                <>
                  {row.columns?.find((col) => col.className === "config")
                    ?.content ?? ""}
                  {row.columns?.find((col) => col.className === "value")
                    ?.content ?? ""}
                </>
              ),
              className: "config",
            },
            row.columns?.find((col) => col.className === "defined") ?? {},
          ];
          return row;
        })
      : rows;
  };

  const headers = [
    {
      content: isCollapsedView ? (
        <Tooltip message="Select configuration to override">
          <Icon name="information" />
        </Tooltip>
      ) : (
        "Override"
      ),
      className: "override",
    },
    { content: <>Configuration{configurationExtra}</>, className: "config" },
    { content: "Value", className: "value" },
    { content: "Defined in", className: "defined" },
  ];

  return (
    <MainTable
      className="u-table-layout--fixed override-table"
      emptyStateMsg={emptyStateMsg}
      headers={filterHeaders(headers)}
      rows={filterRows(collapseRows(rows))}
    />
  );
};

export default ConfigurationTable;
