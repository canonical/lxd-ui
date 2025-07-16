import { SearchBox } from "@canonical/react-components";
import type { FC } from "react";

interface Props {
  onChange: (val: string) => void;
  value: string;
  disabled?: boolean;
  className?: string;
}

const PermissionGroupsFilter: FC<Props> = ({
  onChange,
  value,
  disabled,
  className,
}) => {
  const handleSearchChange = (value: string) => {
    onChange(value.toLowerCase());
  };

  return (
    <div className="permission-groups-filter">
      <SearchBox
        id="search-groups"
        label="Search groups"
        name="search-groups"
        type="text"
        onSearch={handleSearchChange}
        onChange={handleSearchChange}
        value={value}
        placeholder="Search groups"
        disabled={disabled}
        className={className}
      />
    </div>
  );
};

export default PermissionGroupsFilter;
