import type { FC } from "react";

interface Props {
  addresses: string[];
}

const InstanceListAddresses: FC<Props> = ({ addresses }) => {
  if (addresses.length < 3) {
    return addresses.map((address) => <div key={address}>{address}</div>);
  }

  return (
    <>
      <div>{addresses[0]}</div>
      <div>{addresses[1]}</div>
      <div className="p-text--x-small u-text--muted">
        + {addresses.length - 2} more
      </div>
    </>
  );
};

export default InstanceListAddresses;
