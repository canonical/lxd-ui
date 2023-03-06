import React, { FC } from "react";
import {
  Icon,
  List,
  MainTable,
  Row,
  Tooltip,
  Button,
} from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import { fetchProfiles } from "api/profiles";
import BaseLayout from "components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import Loader from "components/Loader";
import { Link, useNavigate, useParams } from "react-router-dom";

const ProfileList: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: profiles = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.profiles],
    queryFn: () => fetchProfiles(project),
  });

  if (error) {
    notify.failure("Could not load profiles.", error);
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Description", sortKey: "description" },
    { content: "Effects", className: "u-align--center" },
    { content: "Used by", sortKey: "used_by", className: "u-align--center" },
  ];

  const rows = profiles.map((profile) => {
    const touchesNetwork = Object.values(profile.devices).some(
      (device) => device.type === "nic"
    );
    const touchesStorage = Object.values(profile.devices).some(
      (device) => device.type === "disk"
    );
    const touchesCloudInit = Object.keys(profile.config).some((config) =>
      config.startsWith("cloud-init")
    );
    const touchesLimits = Object.keys(profile.config).some((config) =>
      config.startsWith("limits")
    );

    const effects = (
      <List
        inline
        items={[
          touchesNetwork ? (
            <Tooltip message="Network" key="1" position="btm-center">
              <Icon name="connected" />
            </Tooltip>
          ) : null,
          touchesStorage ? (
            <Tooltip message="Storage" key="2" position="btm-center">
              <Icon name="pods" />
            </Tooltip>
          ) : null,
          touchesCloudInit ? (
            <Tooltip message="Cloud init" key="3" position="btm-center">
              <Icon name="restart" />
            </Tooltip>
          ) : null,
          touchesLimits ? (
            <Tooltip message="Limit resources" key="4" position="btm-center">
              <Icon name="priority-low" />
            </Tooltip>
          ) : null,
        ].filter((n) => n)}
      />
    );

    const usedBy = <span>{profile.used_by?.length ?? "0"}</span>;

    return {
      columns: [
        {
          content: (
            <Link to={`/ui/${project}/profiles/${profile.name}`}>
              {profile.name}
            </Link>
          ),
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: profile.description,
          role: "rowheader",
          "aria-label": "Description",
        },
        {
          content: effects,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Effects",
        },
        {
          content: usedBy,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Used by",
        },
      ],
      sortData: {
        name: profile.name,
        description: profile.description,
        used_by: profile.used_by,
      },
    };
  });

  return (
    <>
      <BaseLayout
        title="Profiles"
        controls={
          <Button
            appearance="positive"
            onClick={() => navigate(`/ui/${project}/profiles/create-new`)}
          >
            Create new
          </Button>
        }
      >
        <NotificationRow />
        <Row>
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="u-table-layout--auto"
            emptyStateMsg={
              isLoading ? (
                <Loader text="Loading profiles..." />
              ) : (
                "No data to display"
              )
            }
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default ProfileList;
