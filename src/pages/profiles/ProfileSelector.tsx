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

  // determine if any selected profile is not in the profiles list
  // this indicates that there are profiles set on the instance that the user does not have permission to view
  const profileNames = profiles.map((profile) => profile.name);
  const restrictedProfileNames = (initialProfiles || []).filter(
    (profile) => !profileNames.find((name) => name === profile),
  );

  const allProfileNames = [...profileNames, ...restrictedProfileNames];
  const unselected = selected.length
    ? allProfileNames.filter((name) => !selected.includes(name))
    : allProfileNames;

  const addProfile = () => {
    const nextProfile = unselected[0];
    if (nextProfile) {
      setSelected([...selected, nextProfile]);
    }
  };

  const profileOptions = (currSelectIndex: number) => {
    const profileOptions: { label: string; value: string }[] = [];
    const profileSelectFilter = (profileName: string) =>
      !selected.includes(profileName) ||
      selected.indexOf(profileName) === currSelectIndex;

    profileNames.filter(profileSelectFilter).forEach((name) => {
      profileOptions.push({
        label: name,
        value: name,
      });
    });

    if (restrictedProfileNames.length) {
      restrictedProfileNames.filter(profileSelectFilter).forEach((name) => {
        profileOptions.push({
          label: name,
          value: name,
        });
      });
    }

    return profileOptions;
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
              options={profileOptions(index)}
              value={value}
              disabled={readOnly || !!disabledReason}
              title={disabledReason ?? title}
            />
          </div>

          <div className="profile-actions">
            {!readOnly &&
              (index > 0 || selected.length > 1) &&
              !disabledReason && (
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
                    title="move profile up"
                    disabled={index === 0}
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
                    title="move profile down"
                    disabled={index === selected.length - 1}
                  >
                    <Icon name="chevron-down" />
                  </Button>
                </div>
              )}

            {!readOnly && !disabledReason && (
              <Button
                appearance="link"
                className="profile-remove-btn"
                onClick={() =>
                  setSelected(selected.filter((item) => item !== value))
                }
                type="button"
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ))}
      {!readOnly && !disabledReason && (
        <Button
          id="addProfileButton"
          disabled={unselected.length === 0}
          className="profile-add-btn"
          onClick={addProfile}
          type="button"
        >
          Add profile
        </Button>
      )}
    </>
  );
};

export default ProfileSelector;
