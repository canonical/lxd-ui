import { FC } from "react";

interface Props {
  percentage: number;
  text: string;
}

const Meter: FC<Props> = ({ percentage, text }: Props) => {
  return (
    <>
      <div className="p-meter u-no-margin--bottom">
        <div style={{ width: `${percentage}%` }} />
      </div>
      <div className="p-text--small u-no-margin--bottom">{text}</div>
    </>
  );
};

export default Meter;
