import type { FC } from "react";
import { useEffect } from "react";
import {
  Button,
  EmptyState,
  Icon,
  MainTable,
  Row,
  useNotify,
} from "@canonical/react-components";
import Loader from "components/Loader";
import { Link, useNavigate, useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import PageHeader from "components/PageHeader";
import CustomLayout from "components/CustomLayout";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useCurrentProject } from "context/useCurrentProject";
import { useNetworkAcls } from "context/useNetworkAcls";

const NetworkAclList: FC = () => {
  const docBaseLink = useDocs();
  const navigate = useNavigate();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();
  const { project: currentProject } = useCurrentProject();
  const { canCreateNetworkAcls } = useProjectEntitlements();

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
    return {
      columns: [
        {
          content: (
            <Link to={`/ui/project/${project}/network-acl/${acl.name}`}>
              {acl.name}
            </Link>
          ),
          role: "cell",
          "aria-label": "Name",
        },
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
        description: acl.description?.toLowerCase(),
        ingress: acl.ingress.length,
        egress: acl.egress.length,
        usedBy: acl.used_by?.length ?? 0,
      },
    };
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <CustomLayout
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                href={`${docBaseLink}/howto/network_acls/`}
                title="Learn more about network ACLs"
              >
                Network ACLs
              </HelpLink>
            </PageHeader.Title>
          </PageHeader.Left>
          <PageHeader.BaseActions>
            <Button
              appearance="positive"
              className="u-no-margin--bottom"
              hasIcon
              onClick={async () =>
                navigate(`/ui/project/${project}/network-acls/create`)
              }
              disabled={!canCreateNetworkAcls(currentProject)}
              title={
                canCreateNetworkAcls(currentProject)
                  ? ""
                  : "You do not have permission to create ACLs in this project"
              }
            >
              <Icon name="plus" light />
              <span>Create ACL</span>
            </Button>
          </PageHeader.BaseActions>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>
        {networkAcls.length > 0 && (
          <MainTable
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
            image={<Icon className="empty-state-icon" name="exposed" />}
            title="No network ACLs found"
          >
            <p>There are no network ACLs in this project.</p>
            <p>
              <a
                href={`${docBaseLink}/howto/network_acls/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more about network ACLs
                <Icon className="external-link-icon" name="external-link" />
              </a>
            </p>
          </EmptyState>
        )}
      </Row>
    </CustomLayout>
  );
};

export default NetworkAclList;
