import type { FC } from "react";
import { Input, RadioInput } from "@canonical/react-components";

interface Props {
  id: string;
  address?: string;
  setAddress: (address: string) => void;
  family: "IPv4" | "IPv6";
}

const IpAddressSelector: FC<Props> = ({ id, address, setAddress, family }) => {
  const isCustom = address !== "none" && address !== "auto";

  return (
    <>
      <div className="ip-address-selector">
        <RadioInput
          label="Auto"
          checked={address === "auto"}
          onChange={() => {
            setAddress("auto");
          }}
        />
        <RadioInput
          label="None"
          checked={address === "none"}
          onChange={() => {
            setAddress("none");
          }}
        />
      </div>
      <div className="ip-address-selector ip-address-custom">
        <RadioInput
          label="Custom"
          aria-label="custom"
          checked={isCustom}
          onChange={() => {
            setAddress("");
          }}
        />
        <Input
          id={id}
          name={id}
          type="text"
          placeholder="Enter address"
          onChange={(e) => {
            setAddress(e.target.value);
          }}
          value={isCustom && address ? address : ""}
          disabled={!isCustom}
          help={
            <>
              Use CIDR notation.
              <br />
              You can set the option to <code>none</code> to turn off {family},
              or to <code>auto</code> to generate a new random unused subnet.
            </>
          }
        />
      </div>
    </>
  );
};

export default IpAddressSelector;
