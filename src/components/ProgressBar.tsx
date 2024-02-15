import { FC } from "react";

interface Props {
  percentage: number;
}

const ProgressBar: FC<Props> = ({ percentage }: Props) => {
  return (
    <div className="p-progress-bar">
      <div style={{ width: `${percentage}%` }} />
    </div>
  );
};

export default ProgressBar;
