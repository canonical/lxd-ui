import { FC } from "react";
import { MainTable } from "@canonical/react-components";
import Loader from "components/Loader";
import type { LxdInstance } from "types/instance";
import ResourceLink from "components/ResourceLink";
import { useProfiles } from "context/useProfiles";

interface Props {
  instance: LxdInstance;
  onFailure: (title: string, e: unknown) => void;
}

const InstanceOverviewProfiles: FC<Props> = ({ instance, onFailure }) => {
  const {
    data: profiles = [],
    error,
    isLoading,
  } = useProfiles(instance.project);

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

  const profileRows = instance.profiles.map((profileName) => {
    const profile = profiles.find((item) => item.name === profileName);
    const description = profile?.description ?? "";
    return {
      key: profileName,
      columns: [
        {
          content: (
            <ResourceLink
              type="profile"
              value={profileName}
              to={
                profile
                  ? `/ui/project/${instance.project}/profile/${profileName}`
                  : ""
              }
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
        name: profileName.toLowerCase(),
        description: description.toLowerCase(),
      },
    };
  });

  if (isLoading) {
    return <Loader text="Loading profiles..." />;
  }

  return <MainTable headers={profileHeaders} rows={profileRows} sortable />;
};

export default InstanceOverviewProfiles;
