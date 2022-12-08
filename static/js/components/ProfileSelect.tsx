import React, { FC, useState } from "react";
import {
  Button,
  Card,
  Col,
  Icon,
  Label,
  Row,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../util/queryKeys";
import { NotificationHelper } from "../types/notification";
import { fetchProfiles } from "../api/profiles";
import { LxdProfile } from "../types/profile";

interface Props {
  notify: NotificationHelper;
}

const ProfileSelect: FC<Props> = ({ notify }) => {
  const [selectedProfiles, setSelectedProfiles] = useState<LxdProfile[]>([]);

  const toggleProfile = (item: LxdProfile) => {
    setSelectedProfiles((oldList) => {
      return oldList.includes(item)
        ? oldList.filter((i) => i !== item)
        : [...oldList, item];
    });
  };

  const moveUp = (item: LxdProfile) => {
    setSelectedProfiles((oldList) => {
      const index = oldList.indexOf(item);
      if (index === 0) {
        return oldList;
      }
      oldList.splice(index, 1);
      oldList.splice(index - 1, 0, item);
      return [...oldList];
    });
  };

  const moveDown = (item: LxdProfile) => {
    setSelectedProfiles((oldList) => {
      const index = oldList.indexOf(item);
      if (index === oldList.length) {
        return oldList;
      }
      oldList.splice(index, 1);
      oldList.splice(index + 1, 0, item);
      return [...oldList];
    });
  };

  const { data: profiles = [], error } = useQuery({
    queryKey: [queryKeys.profiles],
    queryFn: fetchProfiles,
  });

  if (error) {
    notify.failure("Could not load profiles.", error);
  }

  const unselected = profiles.filter(
    (profile) => !selectedProfiles.includes(profile)
  );

  return (
    <Row>
      <Col size={7}>
        <Card>
          <Label>Applied profiles</Label>
          {selectedProfiles.map((profile) => (
            <Row key={profile.name} className="u-sv1">
              <Col size={1}>
                <Button
                  dense
                  hasIcon
                  onClick={() => moveUp(profile)}
                  type="button"
                >
                  <Icon name="chevron-up" />
                </Button>
              </Col>
              <Col size={1}>
                <Button
                  dense
                  hasIcon
                  onClick={() => moveDown(profile)}
                  type="button"
                >
                  <Icon name="chevron-down" />
                </Button>
              </Col>
              <Col size={3}>
                <span>{profile.name}</span>
              </Col>
              <Col size={1}>
                <Button
                  dense
                  hasIcon
                  onClick={() => toggleProfile(profile)}
                  type="button"
                >
                  {">"}
                </Button>
              </Col>
            </Row>
          ))}
        </Card>
      </Col>
      <Col size={5}>
        <Card>
          <Label>Select profiles</Label>
          {unselected.map((profile) => (
            <Row key={profile.name} className="u-sv1">
              <Col size={2}>
                <Button
                  dense
                  hasIcon
                  onClick={() => toggleProfile(profile)}
                  type="button"
                >
                  {"<"}
                </Button>
              </Col>
              <Col size={3}>
                <span>{profile.name}</span>
              </Col>
            </Row>
          ))}
        </Card>
      </Col>
    </Row>
  );
};

export default ProfileSelect;
