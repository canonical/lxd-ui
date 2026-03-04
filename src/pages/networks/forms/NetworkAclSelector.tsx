import type { FC, ReactNode } from "react";
import { MultiSelect } from "@canonical/react-components";
import { Link } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";
import type { LxdNetworkAcl } from "types/network";

interface Props {
  project: string;
  setSelectedAcls: (acls: string[]) => void;
  selectedAcls: string[];
  availableAcls: LxdNetworkAcl[];
  id?: string;
  inheritedAcls?: string[];
  help?: ReactNode;
  canSelectManualAcls?: boolean;
  label?: string;
}

const NetworkAclSelector: FC<Props> = ({
  project,
  setSelectedAcls,
  selectedAcls,
  availableAcls,
  id = "network-acl-selector",
  inheritedAcls,
  help,
  canSelectManualAcls = true,
  label,
}) => {
  const toOptionList = (list: string[], inheritedAcls?: string[]) => {
    return list.map((item) => {
      return {
        label: inheritedAcls?.includes(item) ? `${item} (from network)` : item,
        value: item,
      };
    });
  };

  const hasAcls = availableAcls.length > 0;
  const isEnabled = canSelectManualAcls && hasAcls;

  const aclLink = (label: string) => (
    <Link
      to={`${ROOT_PATH}/ui/project/${project}/network-acls`}
      target="_blank"
    >
      {label}
    </Link>
  );

  const helpManage =
    availableAcls.length > 0 ? (
      <>Manage {aclLink("ACLs")} for this project.</>
    ) : (
      <>Create an {aclLink("ACL")} to control network access.</>
    );

  const getPlaceholder = () => {
    if (!canSelectManualAcls) {
      return "-";
    }
    if (!hasAcls) {
      return "No ACLs available";
    }
    if (hasAcls) {
      return "Select ACLs";
    }
  };

  return (
    <>
      {label && <label htmlFor={id}>{label}</label>}
      <MultiSelect
        label={label}
        items={toOptionList(
          availableAcls.map((acl) => acl.name),
          inheritedAcls,
        )}
        disabled={!isEnabled}
        selectedItems={toOptionList(selectedAcls)}
        variant={hasAcls ? "condensed" : "search"}
        placeholder={getPlaceholder()}
        onItemsUpdate={(items) => {
          setSelectedAcls(items.map((item) => item.value as string));
        }}
        showDropdownFooter={false}
        id={id}
        disabledItems={inheritedAcls?.map((t) => {
          return { label: t, value: t };
        })}
        help={help ?? helpManage}
      />
    </>
  );
};

export default NetworkAclSelector;
