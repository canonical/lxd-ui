import type { FC } from "react";
import { MultiSelect } from "@canonical/react-components";
import { useNetworkAcls } from "context/useNetworkAcls";

interface Props {
  project: string;
  setSelectedAcls: (acls: string[]) => void;
  selectedAcls: string[];
}

const NetworkAclSelector: FC<Props> = ({
  project,
  setSelectedAcls,
  selectedAcls,
}) => {
  const { data: availableAcls = [] } = useNetworkAcls(project);

  const toOptionList = (list: string[]) => {
    return list.map((item) => {
      return {
        label: item,
        value: item,
      };
    });
  };

  const hasAcls = availableAcls.length > 0;

  return (
    <MultiSelect
      items={toOptionList(availableAcls.map((acl) => acl.name))}
      disabled={!hasAcls}
      selectedItems={toOptionList(selectedAcls)}
      variant={hasAcls ? "condensed" : "search"}
      placeholder={hasAcls ? "Select ACLs" : "No ACLs available"}
      onItemsUpdate={(items) => {
        setSelectedAcls(items.map((item) => item.value as string));
      }}
      showDropdownFooter={false}
    />
  );
};

export default NetworkAclSelector;
