import { LxdClusterMember } from "types/cluster";
import EvacuateClusterMemberBtn from "pages/cluster/actions/EvacuateClusterMemberBtn";
import RestoreClusterMemberBtn from "pages/cluster/actions/RestoreClusterMemberBtn";
import {
  MainTableHeader,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";

export const allClusterGroups = "All cluster groups";

export const getClusterHeaders = (activeGroup?: string): MainTableHeader[] => [
  {
    content: (
      <>
        Name
        <br />
        <div className="header-second-row">Url</div>
      </>
    ),
    className: "name",
  },
  { content: "Roles", sortKey: "roles", className: "roles" },
  {
    content: (
      <>
        Architecture
        <br />
        <div className="header-second-row">Failure domain</div>
      </>
    ),
    className: "architecture",
  },
  { content: "Description", sortKey: "description", className: "description" },
  { content: activeGroup ? "Other groups" : "Groups" },
  {
    content: (
      <>
        Status
        <br />
        <div className="header-second-row">Message</div>
      </>
    ),
    className: "status",
  },
  { "aria-label": "Action", className: "u-align--right actions" },
];

export const getClusterRows = (
  members: LxdClusterMember[],
  activeGroup?: string,
): MainTableRow[] =>
  members.map((member) => {
    return {
      className: "u-row",
      name: member.server_name,
      columns: [
        {
          content: (
            <>
              <div>{member.server_name}</div>
              <div className="u-text--muted">{member.url}</div>
            </>
          ),
          role: "cell",
          "aria-label": "Name and url",
          className: "name",
        },
        {
          content: member.roles.join(", "),
          role: "cell",
          "aria-label": "Roles",
          className: "roles",
        },
        {
          content: (
            <>
              <div>{member.architecture}</div>
              <div className="u-text--muted">{member.failure_domain}</div>
            </>
          ),
          role: "cell",
          "aria-label": "Architecture and failure domain",
          className: "architecture",
        },
        {
          content: member.description,
          role: "cell",
          "aria-label": "Description",
          className: "description",
        },
        {
          content: member.groups
            ?.filter((group) => group !== activeGroup)
            .join(", "),
          role: "cell",
          "aria-label": activeGroup ? "Other groups" : "Groups",
        },
        {
          content: (
            <>
              <div>{member.status}</div>
              <div className="u-text--muted">{member.message}</div>
            </>
          ),
          role: "cell",
          "aria-label": "Status and message",
          className: "status",
        },
        {
          content: (
            <div className="cluster-actions">
              {member.status === "Evacuated" ? (
                <RestoreClusterMemberBtn member={member} />
              ) : (
                <EvacuateClusterMemberBtn member={member} />
              )}
            </div>
          ),
          role: "cell",
          className: "u-align--right actions",
          "aria-label": "Action",
        },
      ],
      sortData: {
        roles: member.roles,
        description: member.description,
      },
    };
  });
