import React, { FC, Fragment } from "react";
import {
  Button,
  Col,
  Icon,
  Label,
  List,
  Row,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { NotificationHelper } from "types/notification";
import { fetchProfiles } from "api/profiles";
import { LxdProfile } from "types/profile";
import Loader from "components/Loader";

interface Props {
  notify: NotificationHelper;
  selected: string[];
  setSelected: (profiles: string[]) => void;
}

const ProfileSelector: FC<Props> = ({ notify, selected, setSelected }) => {
  const toggleProfile = (item: LxdProfile) => {
    const newSelection = selected.includes(item.name)
      ? selected.filter((i) => i !== item.name)
      : [...selected, item.name];
    setSelected(newSelection);
  };

  const moveUp = (item: LxdProfile, index: number) => {
    if (index === 0) {
      return;
    }
    const newSelection = [...selected];
    newSelection.splice(index, 1);
    newSelection.splice(index - 1, 0, item.name);
    setSelected(newSelection);
  };

  const moveDown = (item: LxdProfile, index: number) => {
    if (index === selected.length) {
      return;
    }
    const newSelection = [...selected];
    newSelection.splice(index, 1);
    newSelection.splice(index + 1, 0, item.name);
    setSelected(newSelection);
  };

  const {
    data: profiles = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.profiles],
    queryFn: fetchProfiles,
  });

  if (isLoading) {
    return <Loader text="Loading profiles..." />;
  }

  if (error) {
    notify.failure("Could not load profiles.", error);
  }

  const unselected = profiles.filter(
    (profile) => !selected.includes(profile.name)
  );

  return (
    <>
      <Label className="u-sv-1">Apply profiles</Label>
      <div className="u-text--muted u-sv1">
        Add profiles and create a hierarchy
      </div>
      <Row className="p-profile-select">
        <Col size={6} className="p-profile-select-box">
          <i className="p-profile-select-title">Available profiles</i>
          <hr />
          <div className="p-profile-select-list">
            <List
              items={unselected.map((profile) => (
                <Fragment key={profile.name}>
                  <span
                    className="p-profile-select-name u-truncate"
                    title={profile.name}
                  >
                    {profile.name}
                  </span>
                  <div className="u-float-right">
                    <Button
                      dense
                      hasIcon
                      small
                      type="button"
                      onClick={() => toggleProfile(profile)}
                    >
                      Apply
                    </Button>
                  </div>
                </Fragment>
              ))}
            />
          </div>
        </Col>
        <Col size={6} className="p-profile-select-box">
          <i className="p-profile-select-title">Applied profiles</i>
          <hr />
          <div className="p-profile-select-list">
            <List
              items={selected.map((name, i) => {
                const profile = profiles.find(
                  (profile) => profile.name === name
                );
                if (!profile) {
                  return null;
                }
                return (
                  <Fragment key={profile.name}>
                    <span
                      className="p-profile-select-name u-truncate"
                      title={profile.name}
                    >
                      {profile.name}
                    </span>
                    <div className="u-float-right">
                      <Button
                        appearance="base"
                        className="p-profile-select-button"
                        dense
                        hasIcon
                        small
                        type="button"
                        disabled={i === 0}
                        onClick={() => moveUp(profile, i)}
                      >
                        <Icon name="chevron-up" />
                      </Button>
                      <Button
                        appearance="base"
                        className="p-profile-select-button"
                        dense
                        hasIcon
                        small
                        type="button"
                        disabled={i === selected.length - 1}
                        onClick={() => moveDown(profile, i)}
                      >
                        <Icon name="chevron-down" />
                      </Button>
                      <Button
                        appearance="base"
                        dense
                        hasIcon
                        small
                        type="button"
                        onClick={() => toggleProfile(profile)}
                      >
                        <Icon name="close" />
                      </Button>
                    </div>
                  </Fragment>
                );
              })}
            />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ProfileSelector;
