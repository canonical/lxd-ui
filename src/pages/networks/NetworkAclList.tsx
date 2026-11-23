import { useEffect, type FC } from "react";
import {
  Button,
  EmptyState,
  MainTable,
  Row,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import { Link, useNavigate, useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import NetworkAclExplanationTooltip from "pages/networks/NetworkAclExplanationTooltip";
import PageHeader from "components/PageHeader";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useCurrentProject } from "context/useCurrentProject";
import { useNetworkAcls } from "context/useNetworkAcls";
import DocLink from "components/DocLink";
import { ROOT_PATH } from "util/rootPath";
import DsIcon from "components/DsIcon";
import ProjectRichChip from "pages/projects/ProjectRichChip";
import { useProject } from "context/useProjects";
import { ALL_PROJECTS, getCreateRestriction } from "util/projects";

const NetworkAclList: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { project: projectParam } = useParams<{ project: string }>();
  const { project: currentProject, isAllProjects } = useCurrentProject();
  const { data: defaultProject } = useProject("default", isAllProjects);
  const project = isAllProjects ? ALL_PROJECTS : projectParam;
  const { canCreateNetworkAcls } = useProjectEntitlements();
  const projectForCreation = isAllProjects ? defaultProject : currentProject;
  const projectForCreationName = projectForCreation?.name ?? "default";
  const createAclRestriction = getCreateRestriction({
    canCreate: canCreateNetworkAcls(projectForCreation),
    isAllProjects,
    noPermissionMessage: `You do not have permission to create ACLs in project ${projectForCreationName}`,
    selectProjectMessage: "Select a project to create an ACL",
  });

  if (!project) {
    return <>Missing project</>;
  }

  const { data: networkAcls = [], error, isLoading } = useNetworkAcls(project);

  useEffect(() => {
    if (error) {
      notify.failure("Loading ACLs failed", error);
    }
  }, [error]);

  const headers = [
    { content: "Name", sortKey: "name" },
    ...(isAllProjects
      ? [{ content: "Project", sortKey: "project", className: "project" }]
      : []),
    { content: "Description", sortKey: "description" },
    {
      content: "Ingress Rules",
      sortKey: "ingress",
      className: "u-align--right",
    },
    { content: "Egress Rules", sortKey: "egress", className: "u-align--right" },
    { content: "Used by", sortKey: "usedBy", className: "u-align--right" },
  ];

  const rows = networkAcls.map((acl) => {
    const aclProject = isAllProjects ? (acl.project ?? "default") : project;

    return {
      key: `${aclProject}-${acl.name}`,
      className: "u-row",
      columns: [
        {
          content: (
            <Link
              to={`${ROOT_PATH}/ui/project/${encodeURIComponent(aclProject)}/network-acl/${encodeURIComponent(acl.name)}`}
            >
              {acl.name}
            </Link>
          ),
          role: "rowheader",
          "aria-label": "Name",
        },
        ...(isAllProjects
          ? [
              {
                content: (
                  <ProjectRichChip
                    projectName={aclProject}
                    urlSuffix="/network-acls"
                  />
                ),
                role: "cell",
                "aria-label": "Project",
                className: "project",
              },
            ]
          : []),
        {
          content: acl.description,
          role: "cell",
          "aria-label": "Description",
        },
        {
          content: acl.ingress.length,
          role: "cell",
          "aria-label": "Ingress rules",
          className: "u-align--right",
        },
        {
          content: acl.egress.length,
          role: "cell",
          "aria-label": "Egress rules",
          className: "u-align--right",
        },
        {
          content: (acl.used_by ?? []).length,
          role: "cell",
          "aria-label": "Used by",
          className: "u-align--right",
        },
      ],
      sortData: {
        name: acl.name.toLowerCase(),
        project: aclProject,
        description: acl.description?.toLowerCase(),
        ingress: acl.ingress.length,
        egress: acl.egress.length,
        usedBy: acl.used_by?.length ?? 0,
      },
    };
  });

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  const createAclButton = (
    <Button
      appearance="positive"
      className="u-no-margin--bottom"
      hasIcon
      onClick={async () =>
        navigate(
          `${ROOT_PATH}/ui/project/${encodeURIComponent(projectForCreationName)}/network-acls/create`,
        )
      }
      disabled={isAllProjects || !canCreateNetworkAcls(projectForCreation)}
      title={createAclRestriction}
    >
      <DsIcon icon="plus" />
      <span>Create ACL</span>
    </Button>
  );

  return (
    <CustomLayout
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <NetworkAclExplanationTooltip>
                Network Access Control Lists
              </NetworkAclExplanationTooltip>
            </PageHeader.Title>
          </PageHeader.Left>
          <PageHeader.BaseActions>
            {networkAcls.length > 0 && createAclButton}
          </PageHeader.BaseActions>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>
        {networkAcls.length > 0 && (
          <MainTable
            className="network-acl-table"
            headers={headers}
            rows={rows}
            responsive
            sortable
            emptyStateMsg="No data to display"
          />
        )}
        {!isLoading && networkAcls.length === 0 && (
          <EmptyState
            className="empty-state"
            image={<DsIcon className="empty-state-icon" icon="exposed" />}
            title="No network access control lists found"
          >
            <p>
              {isAllProjects
                ? "There are no network ACLs."
                : "There are no network ACLs in this project."}
            </p>
            <p>
              <DocLink docPath="/howto/network_acls/" hasExternalIcon>
                Learn more about network ACLs
              </DocLink>
            </p>
            {createAclButton}
          </EmptyState>
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkAclList;
