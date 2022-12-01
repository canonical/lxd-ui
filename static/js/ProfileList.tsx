import React, { FC } from "react";
import { Button, MainTable, Row, Tooltip } from "@canonical/react-components";
import NotificationRow from "./components/NotificationRow";
import { fetchProfiles } from "./api/profiles";
import BaseLayout from "./components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./util/queryKeys";
import useNotification from "./util/useNotification";
import usePanelParams from "./util/usePanelParams";
import DeleteProfileBtn from "./buttons/profiles/DeleteProfileBtn";

const ProfileList: FC = () => {
  const notify = useNotification();
  const panelParams = usePanelParams();

  const { data: profiles = [], error } = useQuery({
    queryKey: [queryKeys.profiles],
    queryFn: fetchProfiles,
  });

  if (error) {
    notify.failure("Could not load profiles.", error);
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Description", sortKey: "description" },
    { content: "Used by", sortKey: "used_by", className: "u-align--center" },
    { content: "Actions", className: "u-align--center" },
  ];

  const rows = profiles.map((profile) => {
    const actions = (
      <div>
        <Tooltip message="Delete profile" position="btm-center">
          <DeleteProfileBtn name={profile.name} notify={notify} />
        </Tooltip>
      </div>
    );

    const usedBy = <span>{profile.used_by.length || "0"}</span>;

    return {
      columns: [
        {
          content: profile.name,
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
          className: "u-align--center",
          "aria-label": "Used by",
        },
        {
          content: actions,
          role: "rowheader",
          "aria-label": "Actions",
          className: "u-align--center",
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
            onClick={() => panelParams.openProfileForm()}
          >
            Add profile
          </Button>
        }
      >
        <NotificationRow notify={notify} />
        <Row>
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="u-table-layout--auto"
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default ProfileList;
