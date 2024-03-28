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
import { LxdIdentity } from "types/permissions";
import { fetchPermissionGroups } from "api/permissions";
import SelectableMainTable from "components/SelectableMainTable";
import useSortTableData from "util/useSortTableData";
import { getIdentitiesForGroup } from "util/permissions";

interface Props {
  identity: LxdIdentity;
  submitting: boolean;
  onFinish: (groups: string[]) => void;
  onCancel: () => void;
}

const PermissionIdentityEditGroupsModal: FC<Props> = ({
  identity,
  submitting,
  onCancel,
  onFinish,
}) => {
  const notify = useNotify();
  const [selectedNames, setSelectedNames] = useState<string[]>(
    identity.groups || [],
  );

  const {
    data: groups = [],
    error,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [queryKeys.permissionGroups],
    refetchOnMount: (query) => query.state.isInvalidated,
    queryFn: fetchPermissionGroups,
  });

  if (error) {
    notify.failure("Loading permission groups failed", error);
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Description", sortKey: "description" },
    {
      content: "Permissions",
      sortKey: "permissions",
      className: "u-align--right",
    },
    {
      content: "Identities",
      sortKey: "identities",
      className: "u-align--right",
    },
  ];

  const rows = isFetching
    ? []
    : groups.map((group) => {
        const { totalIdentities } = getIdentitiesForGroup(group);
        return {
          name: group.name,
          className: "u-row",
          columns: [
            {
              content: (
                <span className="u-truncate" title={`name: ${group.name}`}>
                  {group.name}
                </span>
              ),
              role: "cell",
              "aria-label": "Name",
            },
            {
              content: (
                <span
                  className="u-truncate"
                  title={`name: ${group.description}`}
                >
                  {group.description}
                </span>
              ),
              role: "cell",
              "aria-label": "Description",
            },
            {
              content: group.permissions?.length || 0,
              role: "cell",
              className: "u-align--right",
              "aria-label": "Permissions for this group",
            },
            {
              content: totalIdentities,
              role: "cell",
              className: "u-align--right",
              "aria-label": "Identities in this group",
            },
          ],
          sortData: {
            name: group.name,
            description: group.description,
            permissions: group.permissions?.length || 0,
            identities: totalIdentities,
          },
        };
      });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  const handleAllocateGroups = () => {
    onFinish(selectedNames);
  };

  return (
    <Modal
      className="identity-groups-modal"
      close={onCancel}
      title="Modify groups in this identity"
    >
      <NotificationRow />
      <ScrollableTable
        dependencies={[groups, notify.notification]}
        belowIds={["modal-footer"]}
        tableId="groups-modal-table"
      >
        <SelectableMainTable
          id="groups-modal-table"
          headers={headers}
          sortable
          className="u-table-layout--auto"
          emptyStateMsg={
            isLoading || isFetching ? (
              <Loader text="Loading groups..." />
            ) : (
              "No groups found"
            )
          }
          onUpdateSort={updateSort}
          selectedNames={selectedNames}
          setSelectedNames={setSelectedNames}
          itemName="group"
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
            disabled={groups.length === 0}
            onClick={handleAllocateGroups}
          >
            Save identity
          </ActionButton>
        </footer>
      )}
    </Modal>
  );
};

export default PermissionIdentityEditGroupsModal;
