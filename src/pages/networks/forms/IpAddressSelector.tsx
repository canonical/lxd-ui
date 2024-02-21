import { FC } from "react";
import { Input, RadioInput } from "@canonical/react-components";

interface Props {
  id: string;
  address?: string;
  setAddress: (address: string) => void;
}

const IpAddressSelector: FC<Props> = ({ id, address, setAddress }) => {
  const isCustom = address !== "none" && address !== "auto";

  return (
    <>
      <div className="ip-address-selector">
        <RadioInput
          label="auto"
          checked={address === "auto"}
          onChange={() => setAddress("auto")}
        />
        <RadioInput
          label="off"
          checked={address === "none"}
          onChange={() => setAddress("none")}
        />
      </div>
      <div className="ip-address-selector ip-address-custom">
        <RadioInput
          label="Custom"
          aria-label="custom"
          checked={isCustom}
          onChange={() => setAddress("")}
        />
        <Input
          id={id}
          name={id}
          type="text"
          placeholder="Enter address"
          className="u-no-margin--bottom"
          onChange={(e) => setAddress(e.target.value)}
          value={isCustom && address ? address : ""}
          disabled={!isCustom}
        />
      </div>
    </>
  );
};

export default IpAddressSelector;
