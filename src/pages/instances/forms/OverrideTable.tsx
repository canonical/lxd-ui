import React, { FC, ReactNode } from "react";
import { Icon, MainTable, Tooltip } from "@canonical/react-components";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { collapsedViewMaxWidth } from "util/formFields";
import useMediaQuery from "context/mediaQuery";

interface Props {
  rows: MainTableRow[];
  configurationExtra?: ReactNode;
}

const OverrideTable: FC<Props> = ({ rows, configurationExtra }) => {
  const isCollapsedView = useMediaQuery(
    `(max-width: ${collapsedViewMaxWidth}px)`
  );

  const getOverrideHeader = () => {
    if (isCollapsedView) {
      return (
        <Tooltip message="Select configuration to override">
          <Icon name="information" />
        </Tooltip>
      );
    }
    return "Override";
  };

  const headers = [
    { content: getOverrideHeader(), className: "override" },
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
