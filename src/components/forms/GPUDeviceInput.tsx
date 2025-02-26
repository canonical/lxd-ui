import type { FC } from "react";
import { useState } from "react";
import { Input, RadioInput } from "@canonical/react-components";
import type { LxdGPUDevice } from "types/device";

interface Props {
  device: LxdGPUDevice;
  onChange?: (pci?: string, id?: string) => void;
  disableReason?: string;
}

const GpuDeviceInput: FC<Props> = ({ device, onChange, disableReason }) => {
  const [type, setType] = useState(device.pci ? "pci" : "id");
  const isPci = type === "pci";
  const key = `device.${device.name}.${isPci ? "pci" : "id"}`;

  return (
    <>
      <div className="u-sv1">
        <RadioInput
          inline
          labelClassName="margin-right"
          label="ID"
          checked={!isPci}
          onClick={() => setType("id")}
          disabled={!!disableReason}
        />
        <RadioInput
          inline
          label="PCI"
          checked={isPci}
          onClick={() => setType("pci")}
          disabled={!!disableReason}
        />
      </div>
      <Input
        key={key}
        type="text"
        label={isPci ? "PCI Address" : "ID"}
        value={isPci ? device.pci : device.id}
        onChange={(e) =>
          onChange?.(
            isPci ? e.target.value : undefined,
            isPci ? undefined : e.target.value,
          )
        }
        disabled={!!disableReason}
      />
    </>
  );
};
export default GpuDeviceInput;
