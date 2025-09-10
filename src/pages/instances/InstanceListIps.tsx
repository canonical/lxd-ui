import type { FC } from "react";

interface Props {
  ips: string[];
}

const InstanceListIps: FC<Props> = ({ ips }) => {
  if (ips.length < 3) {
    return ips.map((ip) => <div key={ip}>{ip}</div>);
  }

  return (
    <>
      <div>{ips[0]}</div>
      <div>{ips[1]}</div>
      <div className="p-text--x-small u-text--muted">
        + {ips.length - 2} more
      </div>
    </>
  );
};

export default InstanceListIps;
