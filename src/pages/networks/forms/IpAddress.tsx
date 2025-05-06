import type { FC } from "react";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

interface Props {
  row: MainTableRow;
}

const IpAddress: FC<Props> = ({ row }) => {
  return (
    <div className="general-field ip-address">
      <div className="general-field-label can-edit">
        {row.columns?.[0].content}
      </div>
      <div className="general-field-content" key={row.columns?.[2].key}>
        {row.columns?.[2].content}
      </div>
    </div>
  );
};

export default IpAddress;
