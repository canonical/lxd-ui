import React, { FC } from "react";
import { MainTable, Row } from "@canonical/react-components";
import NotificationRow from "./components/NotificationRow";
import { fetchProfiles } from "./api/profiles";
import BaseLayout from "./components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./util/queryKeys";
import useNotification from "./util/useNotification";

const ProfileList: FC = () => {
  const notify = useNotification();

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
    {
      content: "Used by",
      sortKey: "used_by",
      className: "u-align--center",
    },
  ];

  const rows = profiles.map((profile) => {
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
      <BaseLayout title="Profiles">
        <NotificationRow notify={notify} />
        <Row>
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="p-table--profiles"
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default ProfileList;
