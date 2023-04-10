import React, { FC } from "react";
import { MainTable, Row, Button } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import { fetchProfiles } from "api/profiles";
import BaseLayout from "components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import Loader from "components/Loader";
import { Link, useNavigate, useParams } from "react-router-dom";
import ItemName from "components/ItemName";
import { getProfileInstances } from "util/usedBy";

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
    queryKey: [queryKeys.profiles, project],
    queryFn: () => fetchProfiles(project),
  });

  if (error) {
    notify.failure("Loading profiles failed", error);
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Description", sortKey: "description" },
    { content: "Used by", sortKey: "used_by", className: "u-align--right" },
  ];

  const rows = profiles.map((profile) => {
    const isDefaultProject = project === "default";
    const usedBy = (
      <span>
        {getProfileInstances(project, isDefaultProject, profile.used_by).length}
      </span>
    );

    return {
      columns: [
        {
          content: (
            <div className="u-truncate" title={profile.name}>
              <Link to={`/ui/${project}/profiles/detail/${profile.name}`}>
                <ItemName item={profile} />
              </Link>
            </div>
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
          content: usedBy,
          role: "rowheader",
          className: "u-align--right",
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
            onClick={() => navigate(`/ui/${project}/profiles/create`)}
          >
            Create profile
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
