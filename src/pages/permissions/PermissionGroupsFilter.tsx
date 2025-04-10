import { Input } from "@canonical/react-components";
import type { ChangeEvent, FC } from "react";

interface Props {
  onChange: (val: string) => void;
  value: string;
  disabled?: boolean;
}

const PermissionGroupsFilter: FC<Props> = ({ onChange, value, disabled }) => {
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.toLowerCase());
  };

  return (
    <div className="permission-groups-filter">
      <Input
        id="search-groups"
        name="search-groups"
        type="text"
        onChange={handleSearchChange}
        value={value}
        placeholder="Search groups"
        disabled={disabled}
      />
    </div>
  );
};

export default PermissionGroupsFilter;
