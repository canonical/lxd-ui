import { type ClipboardEvent, type ReactElement } from "react";
import PrefixedInput from "./PrefixedInput";
import type { PrefixedInputProps } from "./PrefixedInput";
import { getImmutableAndEditable, isIPv4 } from "util/subnetIpRange";

type Props = Omit<
  PrefixedInputProps,
  "immutableText" | "maxLength" | "placeholder" | "name"
> & {
  cidr: string;
  ip: string;
  name: string;
  onIpChange: (ip: string) => void;
};

const PrefixedIpInput = ({
  cidr,
  help,
  onIpChange,
  ip,
  name,
  ...props
}: Props): ReactElement => {
  const [networkAddress] = cidr.split("/");
  const isIPV4 = isIPv4(networkAddress);

  const [immutable, editable] = getImmutableAndEditable(cidr);

  const inputValue = isIPV4
    ? ip.split(".").slice(immutable.split(".").length).join(".")
    : ip.replace(immutable, "");

  const getIPv4MaxLength = () => {
    const immutableOctetsLength = immutable.split(".").length;
    const lengths = [15, 11, 7, 3]; // Corresponding to 0-3 immutable octets
    return lengths[immutableOctetsLength];
  };

  const maxLength = isIPV4 ? getIPv4MaxLength() : editable.length;
  const placeholder = props.disabled ? "" : editable;

  const setIp = (editableValue: string) => {
    const fullIp = editableValue
      ? isIPV4
        ? `${immutable}.${editableValue}`
        : `${immutable}${editableValue}`
      : "";
    onIpChange(fullIp);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    if (isIPV4) {
      const octets = pastedText.split(".");
      const trimmed = octets.slice(0 - editable.split(".").length);
      const ip = trimmed.join(".");
      setIp(ip);
    } else {
      const ip = pastedText.replace(immutable, "");
      setIp(ip);
    }
  };
  return (
    <PrefixedInput
      help={
        help ? (
          help
        ) : (
          <>
            {isIPV4 ? (
              <>
                The available range in this subnet is{" "}
                <code>
                  {immutable}.{editable}
                </code>
              </>
            ) : (
              <>
                The available IPV6 address range is{" "}
                <code>
                  {immutable}
                  {editable}
                </code>
              </>
            )}
            . If left empty, the address will be dynamically assigned.
          </>
        )
      }
      immutableText={isIPV4 ? `${immutable}.` : immutable}
      maxLength={maxLength}
      name={name}
      onPaste={handlePaste}
      value={inputValue}
      onChange={(e) => {
        setIp(e.target.value);
      }}
      placeholder={placeholder}
      {...props}
    />
  );
};

export default PrefixedIpInput;
