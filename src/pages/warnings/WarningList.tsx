import type { FC } from "react";
import { useState, useEffect } from "react";
import { Row, useNotify } from "@canonical/react-components";
import { fetchWarnings } from "api/warnings";
import { isoTimeToString } from "util/helpers";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import BulkDeleteWarningBtn from "pages/warnings/actions/BulkDeleteWarningBtn";
import SelectableMainTable from "components/SelectableMainTable";
import ScrollableTable from "components/ScrollableTable";
import PageHeader from "components/PageHeader";
import CustomLayout from "components/CustomLayout";

const WarningList: FC = () => {
  const docBaseLink = useDocs();
  const notify = useNotify();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [processingNames, setProcessingNames] = useState<string[]>([]);

  const {
    data: warnings = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.warnings],
    queryFn: async () => fetchWarnings(),
    retry: false, // the api returns a 403 for users with limited permissions, surface the error right away
  });

  if (error) {
    notify.failure("Loading warnings failed", error);
  }

  useEffect(() => {
    const validNames = new Set(warnings?.map((warning) => warning.uuid));
    const validSelections = selectedNames.filter((name) =>
      validNames.has(name),
    );
    if (validSelections.length !== selectedNames.length) {
      setSelectedNames(validSelections);
    }
  }, [warnings]);

  const headers = [
    { content: "Type", sortKey: "type", className: "type" },
    {
      content: "Last message",
      sortKey: "lastMessage",
      className: "last_message",
    },
    { content: "Status", sortKey: "status", className: "status" },
    { content: "Severity", sortKey: "severity", className: "severity" },
    { content: "Count", sortKey: "count", className: "count u-align--right" },
    { content: "Project", sortKey: "project", className: "project" },
    { content: "First seen", sortKey: "firstSeen", className: "first_seen_at" },
    { content: "Last seen", sortKey: "lastSeen", className: "last_seen_at" },
  ];

  const rows = warnings.map((warning) => {
    return {
      key: warning.uuid,
      name: warning.uuid,
      columns: [
        {
          content: warning.type,
          role: "rowheader",
          "aria-label": "Type",
          className: "type",
        },
        {
          content: warning.last_message,
          role: "cell",
          "aria-label": "Last message",
          className: "last_message",
        },
        {
          content: warning.status,
          role: "cell",
          "aria-label": "Status",
          className: "status",
        },
        {
          content: warning.severity,
          role: "cell",
          "aria-label": "Severity",
          className: "severity",
        },
        {
          content: warning.count,
          role: "cell",
          className: "count u-align--right",
          "aria-label": "Count",
        },
        {
          content: warning.project,
          role: "cell",
          className: "project u-align--center",
          "aria-label": "Project",
        },
        {
          content: isoTimeToString(warning.first_seen_at),
          role: "cell",
          "aria-label": "First seen",
          className: "first_seen_at",
        },
        {
          content: isoTimeToString(warning.last_seen_at),
          role: "cell",
          "aria-label": "Last seen",
          className: "last_seen_at",
        },
      ],
      sortData: {
        type: warning.type,
        lastMessage: warning.last_message.toLowerCase(),
        status: warning.status,
        severity: warning.severity,
        count: warning.count,
        project: warning.project.toLowerCase(),
        firstSeen: warning.first_seen_at,
        lastSeen: warning.last_seen_at,
      },
    };
  });

  return (
    <CustomLayout
      mainClassName="images-list"
      contentClassName="u-no-padding--bottom"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                href={`${docBaseLink}/howto/troubleshoot/`}
                title="Learn more about troubleshooting"
              >
                Warnings
              </HelpLink>
            </PageHeader.Title>
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
          dependencies={[warnings]}
          tableId="warning-table"
          belowIds={["status-bar"]}
        >
          <SelectableMainTable
            id="warning-table"
            headers={headers}
            rows={rows}
            paginate={30}
            sortable
            className="warnings-table"
            emptyStateMsg={
              isLoading ? (
                <Loader text="Loading warnings..." />
              ) : (
                "No data to display"
              )
            }
            itemName="warning"
            parentName="server"
            selectedNames={selectedNames}
            setSelectedNames={setSelectedNames}
            filteredNames={rows.map((item) => item.name)}
            disabledNames={processingNames}
          />
        </ScrollableTable>
      </Row>
    </CustomLayout>
  );
};

export default WarningList;
