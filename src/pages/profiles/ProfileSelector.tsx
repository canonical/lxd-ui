import { FC, useEffect } from "react";
import {
  Button,
  Icon,
  Label,
  Select,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchProfiles } from "api/profiles";
import Loader from "components/Loader";
import { defaultFirst } from "util/helpers";

interface Props {
  project: string;
  selected: string[];
  setSelected: (profiles: string[]) => void;
  title?: string;
  readOnly?: boolean;
  disabledReason?: string;
  initialProfiles?: string[];
}

const ProfileSelector: FC<Props> = ({
  project,
  selected,
  setSelected,
  title,
  readOnly = false,
  disabledReason,
  initialProfiles,
}) => {
  const notify = useNotify();

  const {
    data: profiles = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.profiles],
    queryFn: () => fetchProfiles(project),
  });

  useEffect(() => {
    const contentdetails = document.getElementById("content-details");

    if (contentdetails) {
      contentdetails.scrollTop = contentdetails.scrollHeight;
    }
  }, [selected]);

  if (isLoading) {
    return <Loader text="Loading profiles..." />;
  }

  if (error) {
    notify.failure("Loading profiles failed", error);
  }

  profiles.sort(defaultFirst);

  // we combine the initial instance profiles and the profiles from the API list endpoint into a deduplicated list
  // this way, we take into account profiles that the user does not have permission to view
  const profileNames = [
    ...new Set(
      profiles.map((profile) => profile.name).concat(initialProfiles ?? []),
    ),
  ];

  const unselected = profileNames.filter((name) => !selected.includes(name));

  const addProfile = () => {
    const nextProfile = unselected[0];
    if (nextProfile) {
      setSelected([...selected, nextProfile]);
    }
  };

  return (
    <>
      <Label forId="profile-0">Profiles</Label>
      {selected.map((value, index) => (
        <div className="profile-select" key={value}>
          <div>
            <Select
              id={`profile-${index}`}
              aria-label="Select a profile"
              help={
                index > 0 &&
                index === selected.length - 1 &&
                "Each profile overrides the settings specified in previous profiles"
              }
              onChange={(e) => {
                const newValues = [...selected];
                newValues[index] = e.target.value;
                setSelected(newValues);
              }}
              options={profileNames
                .filter(
                  (profile: string) =>
                    !selected.includes(profile) ||
                    selected.indexOf(profile) === index,
                )
                .map((profile) => {
                  return {
                    label: profile,
                    value: profile,
                  };
                })}
              value={value}
              disabled={readOnly || !!disabledReason}
              title={disabledReason ?? title}
            />
          </div>

          <div className="profile-actions">
            {!readOnly && (index > 0 || selected.length > 1) && (
              <div>
                <Button
                  appearance="link"
                  className="profile-action-btn"
                  onClick={() => {
                    const newSelection = [...selected];
                    newSelection.splice(index, 1);
                    newSelection.splice(index - 1, 0, value);
                    setSelected(newSelection);
                  }}
                  type="button"
                  aria-label="move profile up"
                  title={disabledReason ?? "move profile up"}
                  disabled={!!disabledReason || index === 0}
                >
                  <Icon name="chevron-up" />
                </Button>
                <Button
                  appearance="link"
                  className="profile-action-btn"
                  onClick={() => {
                    const newSelection = [...selected];
                    newSelection.splice(index, 1);
                    newSelection.splice(index + 1, 0, value);
                    setSelected(newSelection);
                  }}
                  type="button"
                  aria-label="move profile down"
                  title={disabledReason ?? "move profile down"}
                  disabled={!!disabledReason || index === selected.length - 1}
                >
                  <Icon name="chevron-down" />
                </Button>
              </div>
            )}

            {!readOnly && (
              <Button
                appearance="link"
                className="profile-remove-btn"
                onClick={() =>
                  setSelected(selected.filter((item) => item !== value))
                }
                type="button"
                disabled={!!disabledReason}
                title={disabledReason}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ))}
      {!readOnly && (
        <Button
          id="addProfileButton"
          disabled={!!disabledReason || unselected.length === 0}
          className="profile-add-btn"
          onClick={addProfile}
          type="button"
          title={disabledReason}
        >
          Add profile
        </Button>
      )}
    </>
  );
};

export default ProfileSelector;
