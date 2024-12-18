import { FC } from "react";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

interface Props {
  row: MainTableRow;
}

const IpAddress: FC<Props> = ({ row }) => {
  return (
    <div className="general-field ip-address">
      <div className="general-field-label">{row.columns?.[0].content}</div>
      <div className="general-field-content">{row.columns?.[2].content}</div>
    </div>
  );
};

export default IpAddress;
