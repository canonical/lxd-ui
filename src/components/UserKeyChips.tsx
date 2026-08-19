import type { FC } from "react";
import ExpandableList from "components/ExpandableList";
import UserKeyChip from "components/UserKeyChip";
import type { UserKey } from "types/forms/instanceAndProfile";

interface Props {
  userKeys: UserKey[];
  displayCount?: number;
}

const UserKeyChips: FC<Props> = ({ userKeys, displayCount = 5 }) => {
  if (userKeys.length === 0) {
    return <>-</>;
  }

  return (
    <div className="user-key-chips">
      <ExpandableList
        displayCount={displayCount}
        items={userKeys.map((userKey) => (
          <UserKeyChip key={userKey.key} userKey={userKey} />
        ))}
      />
    </div>
  );
};

export default UserKeyChips;
