import type { FC } from "react";
import { MultiSelect } from "@canonical/react-components";
import type { LxdNetwork } from "types/network";
import type { LoadBalancerPoolInstanceFormValues } from "types/forms/loadBalancers";
import { filterUsedByType } from "util/usedBy";

interface Props {
  selectedItems: LoadBalancerPoolInstanceFormValues[];
  setValue: (value: LoadBalancerPoolInstanceFormValues[]) => void;
  network?: LxdNetwork;
}

const LoadBalancerInstanceSelector: FC<Props> = ({
  selectedItems,
  setValue,
  network,
}) => {
  const availableInstances = filterUsedByType("instance", network?.used_by).map(
    (item) => item.name,
  );

  const toOptionList = (list: string[]) => {
    return list.map((item) => {
      return {
        label: item,
        value: item,
      };
    });
  };

  return (
    <>
      <label htmlFor="pool-instances">Instances</label>
      <MultiSelect
        id="pool-instances"
        variant="condensed"
        hasSelectedItemsFirst={false}
        isSortedAlphabetically={true}
        items={toOptionList(availableInstances)}
        selectedItems={toOptionList(selectedItems.map((item) => item.name))}
        onItemsUpdate={(items) => {
          setValue(
            items.map((item) => {
              return {
                name: item.value as string,
              };
            }),
          );
        }}
        showDropdownFooter={availableInstances.length > 5}
        help="Instances connected to this network that will receive load-balanced traffic"
        emptyMessage="No instances connected to this network"
      />
    </>
  );
};

export default LoadBalancerInstanceSelector;
