import type { FC, ReactNode } from "react";
import { useNotify } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import ScrollableTable from "components/ScrollableTable";
import ConfigurationTable from "components/ConfigurationTable";

interface Props {
  rows: MainTableRow[];
  configurationExtra?: ReactNode;
  emptyStateMsg?: string;
  className?: string;
}

const ScrollableConfigurationTable: FC<Props> = ({
  rows,
  configurationExtra,
  emptyStateMsg,
  className,
}) => {
  const notify = useNotify();

  return (
    <ScrollableTable
      dependencies={[notify.notification]}
      belowIds={["form-footer", "status-bar"]}
      tableId="config-table"
    >
      <ConfigurationTable
        id="config-table"
        className={className}
        rows={rows}
        configurationExtra={configurationExtra}
        emptyStateMsg={emptyStateMsg}
      />
    </ScrollableTable>
  );
};

export default ScrollableConfigurationTable;
