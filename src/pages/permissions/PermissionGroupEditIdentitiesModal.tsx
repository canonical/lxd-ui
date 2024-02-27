import { FC, useState } from "react";
import {
  ActionButton,
  Button,
  Modal,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import ScrollableTable from "components/ScrollableTable";
import NotificationRow from "components/NotificationRow";
import { LxdGroup, LxdIdentity } from "types/permissions";
import { fetchIdentities } from "api/permissions";
import SelectableMainTable from "components/SelectableMainTable";
import useSortTableData from "util/useSortTableData";
import { getIdentitiesForGroup } from "util/permissions";

interface Props {
  group: LxdGroup;
  submitting: boolean;
  onFinish: (identities: LxdIdentity[]) => void;
  onCancel: () => void;
}

const PermissionGroupEditIdentitiesModal: FC<Props> = ({
  group,
  submitting,
  onCancel,
  onFinish,
}) => {
  const notify = useNotify();
  const { allIdentities } = getIdentitiesForGroup(group);
  const [selectedNames, setSelectedNames] = useState<string[]>(allIdentities);

  const {
    data: identities = [],
    error,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [queryKeys.identities],
    refetchOnMount: (query) => query.state.isInvalidated,
    queryFn: fetchIdentities,
  });

  if (error) {
    notify.failure("Loading identities failed", error);
  }

  const headers = [
    { content: "ID", sortKey: "id" },
    { content: "Name", className: "name" },
    { content: "Auth method", sortKey: "authentication_method" },
    { content: "Type", className: "type" },
  ];

  const rows = isFetching
    ? []
    : identities.map((identity) => {
        return {
          name: identity.id,
          className: "u-row",
          columns: [
            {
              content: (
                <span className="u-truncate" title={`id: ${identity.id}`}>
                  {identity.id}
                </span>
              ),
              role: "cell",
              "aria-label": "ID",
            },
            {
              content: (
                <span className="u-truncate" title={`name: ${identity.name}`}>
                  {identity.name}
                </span>
              ),
              role: "cell",
              "aria-label": "Name",
            },
            {
              content: identity.authentication_method,
              role: "cell",
              "aria-label": "Auth method",
            },
            {
              content: (
                <span className="u-truncate" title={`type: ${identity.type}`}>
                  {identity.type}
                </span>
              ),
              role: "cell",
              "aria-label": "Type",
            },
          ],
          sortData: {
            id: identity.id,
            name: identity.name,
            authentication_method: identity.authentication_method,
            type: identity.type,
          },
        };
      });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  const handleAllocateIdentities = () => {
    const selectedIdentitiesLookup = new Set(selectedNames);
    const selectedIdentities = identities.filter((identity) =>
      selectedIdentitiesLookup.has(identity.id),
    );
    onFinish(selectedIdentities);
  };

  return (
    <Modal
      className="group-identities-modal"
      close={onCancel}
      title="Modify identities in this group"
    >
      <NotificationRow />
      <ScrollableTable
        dependencies={[identities, notify.notification]}
        belowIds={["modal-footer"]}
        tableId="identities-modal-table"
      >
        <SelectableMainTable
          id="identities-modal-table"
          headers={headers}
          sortable
          className="u-table-layout--auto"
          emptyStateMsg={
            isLoading || isFetching ? (
              <Loader text="Loading identities..." />
            ) : (
              "No identities found"
            )
          }
          onUpdateSort={updateSort}
          selectedNames={selectedNames}
          setSelectedNames={setSelectedNames}
          itemName="user"
          parentName="system"
          filteredNames={[]}
          processingNames={[]}
          rows={sortedRows}
        />
      </ScrollableTable>
      {!isLoading && (
        <footer className="p-modal__footer" id="modal-footer">
          <Button
            className="u-no-margin--bottom"
            onClick={onCancel}
            appearance="base"
          >
            Cancel
          </Button>
          <ActionButton
            className="u-no-margin--bottom"
            appearance="positive"
            loading={submitting}
            disabled={identities.length === 0}
            onClick={handleAllocateIdentities}
          >
            Save group
          </ActionButton>
        </footer>
      )}
    </Modal>
  );
};

export default PermissionGroupEditIdentitiesModal;
