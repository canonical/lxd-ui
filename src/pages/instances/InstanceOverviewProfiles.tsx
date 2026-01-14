import type { FC } from "react";
import { MainTable, Spinner } from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { useProfiles } from "context/useProfiles";
import ProfileRichChip from "pages/profiles/ProfileRichChip";

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
            <ProfileRichChip
              profileName={profileName}
              projectName={instance.project}
              className="force-truncate"
            />
          ),
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: description,
          role: "cell",
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
    return <Spinner className="u-loader" text="Loading profiles..." />;
  }

  return <MainTable headers={profileHeaders} rows={profileRows} sortable />;
};

export default InstanceOverviewProfiles;
