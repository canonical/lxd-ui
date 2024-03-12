import {
  ActionButton,
  Button,
  Icon,
  useNotify,
} from "@canonical/react-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchIdentities,
  fetchLxdGroups,
  updateGroupsForIdentities,
} from "api/permissions";
import SidePanel from "components/SidePanel";
import { FC, useEffect, useState } from "react";
import { queryKeys } from "util/queryKeys";
import usePanelParams from "util/usePanelParams";
import PermissionLxdGroupsFilter, {
  PermissionLxdGroupsFilterType,
  QUERY,
} from "../PermissionLxdGroupsFilter";
import ScrollableTable from "components/ScrollableTable";
import SelectableMainTable from "components/SelectableMainTable";
import { useSearchParams } from "react-router-dom";
import {
  generateGroupAllocationsForIdentities,
  getCurrentGroupAllocationsForIdentities,
  getIdentitiesForGroup,
} from "util/permissions";
import useSortTableData from "util/useSortTableData";
import { useToastNotification } from "context/toastNotificationProvider";
import { pluralize } from "util/instanceBulkActions";
import useEditHistory from "util/useEditHistory";

type PanelHistoryState = {
  modifiedGroups: Set<string>;
  fullyAllocatedGroups: string[];
  partiallyAllocatedGroups: string[];
};

const PermissionIdentityEditGroupsPanel: FC = () => {
  const panelParams = usePanelParams();
  const [searchParams] = useSearchParams();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const {
    data: groups = [],
    error: groupsError,
    isLoading: groupsLoading,
  } = useQuery({
    queryKey: [queryKeys.lxdGroups],
    queryFn: fetchLxdGroups,
  });

  const {
    data: identities = [],
    error: identitiesError,
    isLoading: identitiesLoading,
  } = useQuery({
    queryKey: [queryKeys.identities],
    queryFn: fetchIdentities,
  });

  const { desiredState, save: saveToPanelHistory } =
    useEditHistory<PanelHistoryState>({
      initialState: {
        modifiedGroups: new Set(),
        fullyAllocatedGroups: [],
        partiallyAllocatedGroups: [],
      },
    });

  const handleModifyGroup = (name: string, action: "select" | "unselect") => {
    const newModifiedGroups = new Set(desiredState.modifiedGroups);
    newModifiedGroups.add(name);

    const newFullyAllocatedGroups =
      action === "unselect"
        ? desiredState.fullyAllocatedGroups.filter(
            (candidate) => candidate !== name,
          )
        : [...desiredState.fullyAllocatedGroups, name];

    const newPartiallyAllocatedGroups =
      desiredState.partiallyAllocatedGroups.filter(
        (candidate) => candidate !== name,
      ) || [];

    saveToPanelHistory({
      modifiedGroups: newModifiedGroups,
      fullyAllocatedGroups: newFullyAllocatedGroups,
      partiallyAllocatedGroups: newPartiallyAllocatedGroups,
    });
  };

  const handleModifyMultipleGroups = (names: string[]) => {
    // If all groups are deselected then all groups are modified
    if (!names.length) {
      saveToPanelHistory({
        fullyAllocatedGroups: names,
        modifiedGroups: new Set(groups.map((group) => group.name)),
        partiallyAllocatedGroups: [],
      });
      return;
    }

    const newModifiedGroups = new Set(desiredState.modifiedGroups);
    names.forEach((name) => {
      newModifiedGroups.add(name);
    });
    saveToPanelHistory({
      fullyAllocatedGroups: names,
      modifiedGroups: newModifiedGroups,
      partiallyAllocatedGroups: [],
    });
  };

  const error = groupsError || identitiesError;
  const isLoading = groupsLoading || identitiesLoading;

  if (error) {
    notify.failure("Loading panel details failed", error);
  }

  const selectedIdentitiesLookup = new Set(panelParams.identities);
  const selectedIdentities = identities.filter((identity) =>
    selectedIdentitiesLookup.has(identity.name),
  );

  // Figure out if groups are allocated to all or some of the selected identities when the panel initially mounts
  useEffect(() => {
    if (!isLoading && !error && selectedIdentities.length) {
      const {
        groupsAllocatedToAllIdentities,
        groupsAllocatedToSomeIdentities,
      } = getCurrentGroupAllocationsForIdentities(groups, selectedIdentities);

      saveToPanelHistory({
        fullyAllocatedGroups: groupsAllocatedToAllIdentities,
        modifiedGroups: desiredState.modifiedGroups,
        partiallyAllocatedGroups: groupsAllocatedToSomeIdentities,
      });
    }
  }, [isLoading, error]);

  useEffect(() => {
    if (!panelParams.identities) {
      panelParams.clear();
      return;
    }
  }, [panelParams.identities?.length]);

  const handleSaveGroups = () => {
    setSubmitting(true);

    const groupsForIdentities = generateGroupAllocationsForIdentities({
      groupsForAllIdentities: desiredState.fullyAllocatedGroups,
      groupsForSomeIdentities: desiredState.partiallyAllocatedGroups,
      identities,
    });

    updateGroupsForIdentities(selectedIdentities, groupsForIdentities)
      .then(() => {
        void queryClient.invalidateQueries({
          predicate: (query) => {
            return [queryKeys.identities, queryKeys.lxdGroups].includes(
              query.queryKey[0] as string,
            );
          },
        });
        const successMessage =
          selectedIdentities.length > 1
            ? `Updated groups for ${selectedIdentities.length} identtiies`
            : `Updated groups for ${selectedIdentities[0].name}`;
        toastNotify.success(successMessage);
        panelParams.clear();
      })
      .catch((e) => {
        notify.failure("Update groups failed", e);
      })
      .finally(() => setSubmitting(false));
  };

  const headers = [
    { content: "Group name", sortKey: "name" },
    {
      content: "Identities",
      sortKey: "identities",
      className: "u-align--right",
    },
    {
      content: "Permissions",
      sortKey: "permissions",
      className: "u-align--right",
    },
    {
      content: "",
      role: "rowheader",
      "aria-label": "Modified status",
      className: "modified-status",
    },
  ];

  const filters: PermissionLxdGroupsFilterType = {
    queries: searchParams.getAll(QUERY),
  };

  const filteredGroups = groups.filter((group) => {
    return filters.queries.every((q) => group.name.toLowerCase().includes(q));
  });

  const rows = filteredGroups.map((group) => {
    const { totalIdentities } = getIdentitiesForGroup(group);
    return {
      name: group.name,
      className: "u-row",
      columns: [
        {
          content: group.name,
          role: "cell",
          "aria-label": "Name",
        },
        {
          content: totalIdentities,
          role: "cell",
          className: "u-align--right",
          "aria-label": "Number of identities in this group",
        },
        {
          content: group.permissions?.length || 0,
          role: "cell",
          className: "u-align--right",
          "aria-label": "Number of permissions for this group",
        },
        {
          content: desiredState.modifiedGroups.has(group.name) && (
            <Icon name="status-in-progress-small" />
          ),
          role: "cell",
          "aria-label": "Modified status",
          className: "modified-status u-align--right",
        },
      ],
      sortData: {
        name: group.name,
        permissions: group.permissions?.length || 0,
        identities: totalIdentities,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({ rows });

  // unmodified groups should always reflect if they are fully allocated based on identities selected
  const { groupsAllocatedToAllIdentities, groupsAllocatedToSomeIdentities } =
    getCurrentGroupAllocationsForIdentities(groups, selectedIdentities);

  const unModifiedfullyAllocatedGroups = groupsAllocatedToAllIdentities.filter(
    (group) => !desiredState.modifiedGroups.has(group),
  );

  const partiallyAllocatedGroups = groupsAllocatedToSomeIdentities.filter(
    (group) => !desiredState.modifiedGroups.has(group),
  );

  const fullyAllocatedGroups = Array.from(
    new Set(
      desiredState.fullyAllocatedGroups.concat(unModifiedfullyAllocatedGroups),
    ).values(),
  );

  const content = (
    <ScrollableTable
      dependencies={[groups]}
      tableId="permission-identity-groups-table"
      belowIds={["panel-footer"]}
    >
      <SelectableMainTable
        id="permission-identity-groups-table"
        headers={headers}
        rows={sortedRows}
        sortable
        emptyStateMsg="No lxd groups found"
        onUpdateSort={updateSort}
        itemName="group"
        parentName="server"
        selectedNames={fullyAllocatedGroups}
        setSelectedNames={handleModifyMultipleGroups}
        processingNames={[]}
        filteredNames={groups.map((group) => group.name)}
        indeterminateNames={partiallyAllocatedGroups}
        onToggleRow={handleModifyGroup}
      />
    </ScrollableTable>
  );

  const panelTitle =
    selectedIdentities.length > 1
      ? `Change groups for ${selectedIdentities.length} users`
      : `Change groups for ${selectedIdentities[0]?.name}`;

  return (
    <SidePanel
      isOverlay
      loading={isLoading}
      hasError={!groups || !identities}
      className="identity-groups-panel"
    >
      <SidePanel.Header>
        <SidePanel.HeaderTitle>{panelTitle}</SidePanel.HeaderTitle>
      </SidePanel.Header>
      <div className="group-count">{`${fullyAllocatedGroups.length} ${pluralize("group", fullyAllocatedGroups.length)} selected`}</div>
      <PermissionLxdGroupsFilter />
      <SidePanel.Content className="u-no-padding">{content}</SidePanel.Content>
      <SidePanel.Footer className="u-align--right">
        <Button
          appearance="base"
          onClick={panelParams.clear}
          className="u-no-margin--bottom"
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          loading={submitting}
          onClick={handleSaveGroups}
          className="u-no-margin--bottom"
        >
          Confirm groups
        </ActionButton>
      </SidePanel.Footer>
    </SidePanel>
  );
};

export default PermissionIdentityEditGroupsPanel;
