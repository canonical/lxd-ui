import type { FC, ReactNode } from "react";
import { MultiSelect } from "@canonical/react-components";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { classifyClusterMemberRoles } from "util/clusterMember";

interface Props {
  setSelectedRoles: (roles: string[]) => void;
  selectedRoles: string[];
  id?: string;
  help?: ReactNode;
  label?: string;
}

const ClusterMemberRolesSelector: FC<Props> = ({
  setSelectedRoles,
  selectedRoles,
  id = "cluster-member-roles-selector",
  help,
  label = "Custom roles",
}) => {
  const { hasClusteringControlPlane } = useSupportedFeatures();

  const ROLES = [
    hasClusteringControlPlane ? "control-plane" : "event-hub",
    "ovn-chassis",
  ];

  const {
    automaticRoles: selectedAutomaticRoles,
    customRoles: selectedCustomRoles,
  } = classifyClusterMemberRoles(selectedRoles);

  return (
    <>
      {label && <label htmlFor={id}>{label}</label>}
      <MultiSelect
        label={label}
        items={ROLES.map((item) => {
          return {
            label: item,
            value: item,
          };
        })}
        selectedItems={selectedCustomRoles.map((item) => {
          return {
            label: item,
            value: item,
          };
        })}
        variant="condensed"
        placeholder="Select custom roles"
        onItemsUpdate={(items) => {
          setSelectedRoles([
            ...selectedAutomaticRoles,
            ...items.map((item) => item.value as string),
          ]);
        }}
        showDropdownFooter={false}
        id={id}
        help={help}
        isSortedAlphabetically={false}
      />
    </>
  );
};

export default ClusterMemberRolesSelector;
