import { FC, ReactNode } from "react";
import { useNotify } from "@canonical/react-components";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import ScrollableTable from "components/ScrollableTable";
import ConfigurationTable from "components/ConfigurationTable";

interface Props {
  rows: MainTableRow[];
  configurationExtra?: ReactNode;
  emptyStateMsg?: string;
}

const ScrollableConfigurationTable: FC<Props> = ({
  rows,
  configurationExtra,
  emptyStateMsg,
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
        rows={rows}
        configurationExtra={configurationExtra}
        emptyStateMsg={emptyStateMsg}
      />
    </ScrollableTable>
  );
};

export default ScrollableConfigurationTable;
