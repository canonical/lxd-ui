import type { FC } from "react";

interface Props {
  addresses: string[];
  numberToShow?: number;
}

const InstanceListAddresses: FC<Props> = ({ addresses, numberToShow = 2 }) => {
  if (addresses.length <= numberToShow) {
    return addresses.map((address) => <div key={address}>{address}</div>);
  }

  return (
    <>
      {addresses.slice(0, numberToShow).map((address) => (
        <div key={address}>{address}</div>
      ))}
      <div className="p-text--x-small u-text--muted instance-list-addresses-more">
        + {addresses.length - numberToShow} more
      </div>
    </>
  );
};

export default InstanceListAddresses;
