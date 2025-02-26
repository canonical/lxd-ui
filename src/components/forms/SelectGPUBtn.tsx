import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { usePortal } from "@canonical/react-components";
import SelectGPUModal from "components/forms/SelectGPUModal";
import type { GpuCard } from "types/resources";

interface Props {
  onSelect: (image: GpuCard) => void;
  disabledReason?: string;
}

const SelectGPUBtn: FC<Props> = ({ onSelect, disabledReason }) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const handleSelect = (card: GpuCard) => {
    closePortal();
    onSelect(card);
  };

  return (
    <>
      <Button
        onClick={openPortal}
        type="button"
        hasIcon
        disabled={!!disabledReason}
        title={disabledReason}
      >
        <Icon name="plus" />
        <span>Attach GPU</span>
      </Button>
      {isOpen && (
        <Portal>
          <SelectGPUModal onClose={closePortal} onSelect={handleSelect} />
        </Portal>
      )}
    </>
  );
};
export default SelectGPUBtn;
