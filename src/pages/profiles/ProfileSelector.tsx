import { FC } from "react";
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
}

const ProfileSelector: FC<Props> = ({
  project,
  selected,
  setSelected,
  title,
  readOnly = false,
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

  if (isLoading) {
    return <Loader text="Loading profiles..." />;
  }

  if (error) {
    notify.failure("Loading profiles failed", error);
  }

  profiles.sort(defaultFirst);

  const unselected = profiles.filter(
    (profile) => !selected.includes(profile.name),
  );

  const addProfile = () => {
    const nextProfile = unselected.pop()?.name;
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
                selected[index] = e.target.value;
                setSelected(selected);
              }}
              options={profiles
                .filter(
                  (profile) =>
                    !selected.includes(profile.name) ||
                    selected.indexOf(profile.name) === index,
                )
                .map((profile) => {
                  return {
                    label: profile.name,
                    value: profile.name,
                  };
                })}
              value={value}
              disabled={readOnly}
              title={title}
            ></Select>
          </div>
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
              {index > 0 && (
                <Button
                  appearance="link"
                  className="profile-delete-btn"
                  onClick={() =>
                    setSelected(selected.filter((item) => item !== value))
                  }
                  type="button"
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
      {!readOnly && (
        <Button
          disabled={unselected.length === 0}
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
