import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { MainTable, Notification } from "@canonical/react-components";
import Loader from "components/Loader";
import type { LxdInstance } from "types/instance";
import { fetchProfiles } from "api/profiles";
import ResourceLink from "components/ResourceLink";

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
    { content: "Name", sortKey: "name", className: "u-text--muted" },
    {
      content: "Description",
      sortKey: "description",
      className: "u-text--muted",
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
      key: profile,
      columns: [
        {
          content: (
            <ResourceLink
              type="profile"
              value={profile}
              to={`/ui/project/${instance.project}/profile/${profile}`}
            />
          ),
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: description,
          role: "rowheader",
          title: `Description ${description}`,
          "aria-label": "Description",
        },
      ],
      sortData: {
        name: profile.toLowerCase(),
        description: description.toLowerCase(),
      },
    };
  });

  const getContent = () => {
    if (isLoading) {
      return <Loader text="Loading profiles..." />;
    }

    if (!profiles.length) {
      return (
        <Notification severity="caution" title="Restricted permissions">
          You do not have permission to view the profiles applied to this
          instance.
        </Notification>
      );
    }

    return <MainTable headers={profileHeaders} rows={profileRows} sortable />;
  };

  return getContent();
};

export default InstanceOverviewProfiles;
