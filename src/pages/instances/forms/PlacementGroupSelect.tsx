import type { FC } from "react";
import { CustomSelect } from "@canonical/react-components";
import { usePlacementGroups } from "context/usePlacementGroups";
import type { SelectRef } from "@canonical/react-components/dist/components/CustomSelect/CustomSelect";
import { Link } from "react-router-dom";
import { pluralize } from "util/instanceBulkActions";
import type { CustomSelectOption } from "@canonical/react-components/dist/components/CustomSelect/CustomSelectDropdown/CustomSelectDropdown";
import { useProfiles } from "context/useProfiles";

interface Props {
  value?: string;
  setValue: (value: string) => void;
  project: string;
  ref?: SelectRef;
  hasNoneOption?: boolean;
  isCreateInstance?: boolean;
  disabled?: boolean;
  profileNames?: string[];
}

const PlacementGroupSelect: FC<Props> = ({
  value,
  setValue,
  project,
  ref,
  hasNoneOption = false,
  isCreateInstance = false,
  disabled = false,
  profileNames = [],
}) => {
  const { data: profiles = [] } = useProfiles(project);
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

  const getInheritedValue = () => {
    let result = null;
    for (const profileName of profileNames) {
      const profile = profiles.find((item) => item.name === profileName);
      if (profile?.config["placement.group"]) {
        result = (
          <>
            {profile.config["placement.group"]}{" "}
            <span className="u-text--muted">
              (from profile <code>{profile.name}</code>)
            </span>
          </>
        );
      }
    }
    return result;
  };

  if (hasNoneOption) {
    const inheritedValue = getInheritedValue();

    placementGroupOptions.push({
      label: (
        <div className="label">
          <span className="name">{inheritedValue ?? "None"}</span>
        </div>
      ),
      selectedLabel: inheritedValue ?? undefined,
      text: "None",
      value: "",
    });
  }

  const placementGroupLink = (count: number) => (
    <Link to={`/ui/project/${project}/placement-groups`} target="_blank">
      {pluralize("placement group", count)}
    </Link>
  );

  const getHelp = () => {
    if (placementGroups.length === 0) {
      return (
        <>
          {!isCreateInstance && "No placement groups found for this project. "}
          <>Create your first {placementGroupLink(1)}.</>
        </>
      );
    }

    return (
      <>
        {!isCreateInstance &&
          "Update does not move the instance. Changed placement policy applies only to future LXD scheduling events such as evacuation. "}
        <>Manage {placementGroupLink(2)} for this project.</>
      </>
    );
  };

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
      help={getHelp()}
      options={placementGroupOptions}
      disabled={disabled || placementGroups.length === 0}
    />
  );
};

export default PlacementGroupSelect;
