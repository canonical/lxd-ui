import type { FC, ReactNode } from "react";
import { CustomSelect } from "@canonical/react-components";
import { usePlacementGroups } from "context/usePlacementGroups";
import type { SelectRef } from "@canonical/react-components/dist/components/CustomSelect/CustomSelect";
import { Link } from "react-router-dom";
import { pluralize } from "util/instanceBulkActions";
import type { CustomSelectOption } from "@canonical/react-components/dist/components/CustomSelect/CustomSelectDropdown/CustomSelectDropdown";

interface Props {
  value?: string;
  setValue: (value: string) => void;
  project: string;
  ref?: SelectRef;
  help?: ReactNode;
  hasNoneOption?: boolean;
  disabled?: boolean;
}

const PlacementGroupSelect: FC<Props> = ({
  value,
  setValue,
  project,
  ref,
  help,
  hasNoneOption = false,
  disabled = false,
}) => {
  const { data: placementGroups = [] } = usePlacementGroups(project);
  const placementGroupOptions: CustomSelectOption[] = placementGroups.map(
    (group) => ({
      label: (
        <div className="label">
          <span className="name u-truncate" title={group.name}>
            {group.name}
          </span>
          <span className="policy">{group.config.policy}</span>
          <span className="rigor">{group.config.rigor}</span>
          <span className="used_by">{group.used_by.length}</span>
        </div>
      ),
      text: group.name,
      selectedLabel: (
        <>
          {group.name}{" "}
          <span className="u-text--muted">
            ({group.config.policy}, {group.config.rigor})
          </span>
        </>
      ),
      value: group.name,
    }),
  );

  if (hasNoneOption) {
    placementGroupOptions.push({
      label: (
        <div className="label">
          <span className="name">None</span>
        </div>
      ),
      text: "None",
      value: "",
    });
  }

  const placementGroupLink = (count: number) => (
    <Link to={`/ui/project/${project}/placement-groups`} target="_blank">
      {pluralize("placement group", count)}
    </Link>
  );

  return (
    <CustomSelect
      id="placementGroup"
      label="Placement group"
      wrapperClassName="select-input"
      dropdownClassName="instance-target-dropdown"
      selectRef={ref}
      onChange={setValue}
      value={value ?? ""}
      header={
        <div className="header">
          <span className="name">Name</span>
          <span className="policy">Policy</span>
          <span className="rigor">Rigor</span>
          <span className="used_by">Used by</span>
        </div>
      }
      help={
        <>
          {help}
          {placementGroups.length === 0 ? (
            <>Create your first {placementGroupLink(1)}.</>
          ) : (
            <>Manage {placementGroupLink(2)} for this project.</>
          )}
        </>
      }
      options={placementGroupOptions}
      disabled={disabled || placementGroups.length === 0}
    />
  );
};

export default PlacementGroupSelect;
