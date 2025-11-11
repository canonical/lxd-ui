import { Notification } from "@canonical/react-components";
import Tag from "components/Tag";
import type { FC } from "react";

interface Props {
  isVisible: boolean;
}

const LoggedInUserNotification: FC<Props> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <Notification
      severity="caution"
      title="Self-modification"
      className="u-no-margin--bottom"
      id="current-user-warning"
    >
      This action will modify the permissions of the current logged-in identity.
      <br />
      <Tag className="u-no-margin--left" isVisible={isVisible}>
        You
      </Tag>{" "}
      might not be able to reverse this change once you&rsquo;ve made it.
    </Notification>
  );
};

export default LoggedInUserNotification;
