import { useState, useEffect, type FC } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Row,
  ScrollableTable,
  useNotify,
  CustomLayout,
  Spinner,
} from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import SelectableMainTable from "components/SelectableMainTable";
import WarningExplanationTooltip from "pages/warnings/WarningExplanationTooltip";
import PageHeader from "components/PageHeader";
import WarningSearchFilter from "pages/warnings/WarningSearchFilter";
import BulkDeleteWarningBtn from "pages/warnings/actions/BulkDeleteWarningBtn";
import { useWarnings } from "context/useWarnings";
import type { LxdWarningSeverity, LxdWarningStatus } from "types/warning";
import {
  getWarningHeaders,
  getWarningRows,
  QUERY,
  SEVERITY,
  STATUS,
  type WarningFilters,
} from "util/warnings";

const WarningList: FC = () => {
  const notify = useNotify();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [processingNames, setProcessingNames] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const { data: warnings = [], error, isLoading } = useWarnings();

  if (error) {
    notify.failure("Loading warnings failed", error);
  }

  const hasWarnings = isLoading || warnings.length > 0;

  const filters: WarningFilters = {
    queries: searchParams.getAll(QUERY).map((value) => value.toLowerCase()),
    statuses: searchParams.getAll(STATUS) as LxdWarningStatus[],
    severities: searchParams.getAll(SEVERITY) as LxdWarningSeverity[],
  };

  const filteredWarnings = warnings.filter((item) => {
    if (
      !filters.queries.every(
        (q) =>
          item.type.toLowerCase().includes(q.toLowerCase()) ||
          item.last_message.toLowerCase().includes(q.toLowerCase()),
      )
    ) {
      return false;
    }
    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(item.status)
    ) {
      return false;
    }
    if (
      filters.severities.length > 0 &&
      !filters.severities.includes(item.severity)
    ) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    const validNames = new Set(
      filteredWarnings?.map((warning) => warning.uuid),
    );
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name),
    );
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [filteredWarnings]);

  const rows = getWarningRows(filteredWarnings);

  return (
    <CustomLayout
      mainClassName="images-list"
      contentClassName="u-no-padding--bottom"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <WarningExplanationTooltip>Warnings</WarningExplanationTooltip>
            </PageHeader.Title>
            {hasWarnings && selectedNames.length === 0 && (
              <PageHeader.Search>
                <WarningSearchFilter
                  key={`warning-${searchParams.get("search")}`}
                />
              </PageHeader.Search>
            )}
            {selectedNames.length > 0 && (
              <BulkDeleteWarningBtn
                warningIds={selectedNames}
                onStart={() => {
                  setProcessingNames(selectedNames);
                }}
                onFinish={() => {
                  setProcessingNames([]);
                }}
              />
            )}
          </PageHeader.Left>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>
        <ScrollableTable
          dependencies={[filteredWarnings]}
          tableId="warning-table"
          belowIds={["status-bar"]}
        >
          <SelectableMainTable
            id="warning-table"
            headers={getWarningHeaders()}
            rows={rows}
            paginate={30}
            sortable
            className="warnings-table"
            emptyStateMsg={
              isLoading ? (
                <Spinner className="u-loader" text="Loading warnings..." />
              ) : (
                "No warnings found matching this search"
              )
            }
            itemName="warning"
            parentName="server"
            selectedNames={selectedNames}
            setSelectedNames={setSelectedNames}
            filteredNames={filteredWarnings.map((warning) => warning.uuid)}
            disabledNames={processingNames}
            responsive
          />
        </ScrollableTable>
      </Row>
    </CustomLayout>
  );
};

export default WarningList;
