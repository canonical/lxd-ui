import React, { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { MainTable } from "@canonical/react-components";
import Loader from "components/Loader";
import { LxdInstance } from "types/instance";
import { Link } from "react-router-dom";
import { fetchProfiles } from "api/profiles";

interface Props {
  instance: LxdInstance;
  onFailure: (title: string, e: unknown) => void;
}

const InstanceOverviewProfiles: FC<Props> = ({ instance, onFailure }) => {
  const {
    data: profiles = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.profiles, instance.project],
    queryFn: () => fetchProfiles(instance.project),
  });

  if (error) {
    onFailure("Loading profiles failed", error);
  }

  const profileHeaders = [
    { content: "Name", sortKey: "name", className: "p-muted-heading" },
    {
      content: "Description",
      sortKey: "description",
      className: "p-muted-heading",
    },
  ];

  const profileRows = instance.profiles.map((profile) => {
    if (profiles.length < 1) {
      return {
        columns: undefined,
      };
    }
    const description = profiles.filter((item) => item.name === profile)[0]
      .description;
    return {
      columns: [
        {
          content: (
            <Link
              to={`/ui/project/${instance.project}/profiles/detail/${profile}`}
              title={profile}
            >
              {profile}
            </Link>
          ),
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: description,
          role: "rowheader",
          title: description,
          "aria-label": "Description",
        },
      ],
      sortData: {
        name: profile.toLowerCase(),
        description: description.toLowerCase(),
      },
    };
  });

  return (
    <>
      {isLoading ? (
        <Loader text="Loading profiles..." />
      ) : (
        <MainTable headers={profileHeaders} rows={profileRows} sortable />
      )}
    </>
  );
};

export default InstanceOverviewProfiles;
