import { Button, Icon } from "@canonical/react-components";
import { FC, useEffect, useRef, useState } from "react";
import { ChangeSummary } from "util/permissionIdentities";
import Tag from "components/Tag";
import { LxdIdentity } from "types/permissions";
import LoggedInUserNotification from "./LoggedInUserNotification";
import { useSettings } from "context/useSettings";
import {
  getAbsoluteHeightBelowById,
  getAbsoluteHeightBelowBySelector,
  getElementAbsoluteHeight,
} from "util/helpers";
import useEventListener from "@use-it/event-listener";

interface Props {
  identityGroupsChangeSummary: ChangeSummary;
  groupIdentitiesChangeSummary: ChangeSummary;
  identities: LxdIdentity[];
  initialGroupBy: "identity" | "group";
}

const generateRowsFromIdentityGroupChanges = (
  identityGroupsChangeSummary: ChangeSummary,
  loggedInIdentityID: string,
) => {
  const identityIDs = Object.keys(identityGroupsChangeSummary);

  const rows: JSX.Element[] = [];
  for (const id of identityIDs) {
    const groupChangesForIdentity = identityGroupsChangeSummary[id];
    const identityLoggedIn = id === loggedInIdentityID;
    const addedGroups: JSX.Element[] = [];
    const removedGroups: JSX.Element[] = [];

    for (const group of groupChangesForIdentity.added) {
      addedGroups.push(
        <p className="u-no-padding--top u-sv-1" key={`${id}-${group}-added`}>
          + {group}
        </p>,
      );
    }

    for (const group of groupChangesForIdentity.removed) {
      removedGroups.push(
        <p className="u-no-padding--top u-sv-1" key={`${id}-${group}-removed`}>
          - <span className="removed">{group}</span>
        </p>,
      );
    }

    rows.push(
      <tr key={id} className="modified-row">
        <td>
          <p className="u-no-padding--top u-sv-1">
            {groupChangesForIdentity.name}
            <Tag isVisible={identityLoggedIn}>You</Tag>
          </p>
        </td>
        <td>{addedGroups.concat(removedGroups)}</td>
      </tr>,
    );
  }

  return rows;
};

const generateRowsFromGroupIdentityChanges = (
  groupIdentitiesChangeSummary: ChangeSummary,
  loggedInIdentityID: string,
  identities: LxdIdentity[],
) => {
  const groups = Object.keys(groupIdentitiesChangeSummary);
  const identityNameLookup: Record<string, string> = {};
  identities.forEach(
    (identity) => (identityNameLookup[identity.id] = identity.name),
  );

  const rows: JSX.Element[] = [];
  for (const group of groups) {
    const identityChangesForGroup = groupIdentitiesChangeSummary[group];
    const addedIdentities: JSX.Element[] = [];
    const removedIdentities: JSX.Element[] = [];

    for (const identity of identityChangesForGroup.added) {
      const identityLoggedIn = identity === loggedInIdentityID;
      addedIdentities.push(
        <p
          className="u-no-padding--top u-sv-1"
          key={`${group}-${identity}-added`}
        >
          +&nbsp;{identityNameLookup[identity]}
          <Tag isVisible={identityLoggedIn}>You</Tag>
        </p>,
      );
    }

    for (const identity of identityChangesForGroup.removed) {
      const identityLoggedIn = identity === loggedInIdentityID;
      removedIdentities.push(
        <p
          className="u-no-padding--top u-sv-1"
          key={`${group}-${identity}-removed`}
        >
          -&nbsp;<span className="removed">{identityNameLookup[identity]}</span>
          <Tag isVisible={identityLoggedIn}>You</Tag>
        </p>,
      );
    }

    rows.push(
      <tr key={group} className="modified-row">
        <td>
          <p className="u-no-padding--top u-sv-1">{group}</p>
        </td>
        <td>{addedIdentities.concat(removedIdentities)}</td>
      </tr>,
    );
  }

  return rows;
};

const GroupsOrIdentityChangesTable: FC<Props> = ({
  groupIdentitiesChangeSummary,
  identityGroupsChangeSummary,
  identities,
  initialGroupBy,
}) => {
  const { data: settings } = useSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const [groupBy, setGroupBy] = useState(initialGroupBy);
  const loggedInIdentityID = settings?.auth_user_name ?? "";
  const loggedInIdentityModified =
    loggedInIdentityID in identityGroupsChangeSummary;

  const updateModalTableHeight = () => {
    const tableContainer = containerRef.current;
    if (!tableContainer) {
      return;
    }
    // first let the table grow vertically as much as needed
    tableContainer.setAttribute("style", "height: auto;");
    const modalMaxHeight = window.innerHeight - 64;
    const headerHeight = getAbsoluteHeightBelowBySelector(".p-modal__header");
    const notificationHeight = getAbsoluteHeightBelowById(
      "current-user-warning",
    );
    const footerHeight = getAbsoluteHeightBelowBySelector(".p-modal__footer");
    const tableHeight = getElementAbsoluteHeight(tableContainer);

    const remainingTableHeight =
      modalMaxHeight - notificationHeight - headerHeight - footerHeight;
    if (tableHeight >= remainingTableHeight) {
      const style = `height: ${remainingTableHeight}px;`;
      tableContainer.setAttribute("style", style);
    }
  };

  useEventListener("resize", updateModalTableHeight);
  useEffect(updateModalTableHeight, [groupBy]);

  const handleChangeGroupBy = () => {
    setGroupBy((prev) => {
      if (prev === "identity") {
        return "group";
      }

      return "identity";
    });
  };

  let rows: JSX.Element[] = [];
  if (groupBy === "identity") {
    rows = generateRowsFromIdentityGroupChanges(
      identityGroupsChangeSummary,
      loggedInIdentityID,
    );
  }

  if (groupBy === "group") {
    rows = generateRowsFromGroupIdentityChanges(
      groupIdentitiesChangeSummary,
      loggedInIdentityID,
      identities,
    );
  }

  return (
    <>
      <div ref={containerRef} className="confirm-table">
        <table>
          <thead>
            <tr>
              <th className="display-by-header">
                {groupBy === "identity" ? "Identity" : "Group"}
                <Button
                  onClick={handleChangeGroupBy}
                  className="display-by-button u-no-margin"
                  hasIcon
                  dense
                  appearance="base"
                >
                  <Icon name="change-version" />
                </Button>
              </th>
              <th>{groupBy === "identity" ? "Group" : "Identity"}</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
      <LoggedInUserNotification isVisible={loggedInIdentityModified} />
    </>
  );
};

export default GroupsOrIdentityChangesTable;
