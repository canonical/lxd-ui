import { FC } from "react";

interface Props {
  entitlement: string;
  description: string;
}

const EntitlementOptionLabel: FC<Props> = ({ entitlement, description }) => {
  return (
    <div className="label">
      <span title={entitlement} className="entitlement u-truncate">
        {entitlement}
      </span>
      <span
        title={description}
        className="entitlement-description u-truncate u-text--muted"
      >
        {description}
      </span>
    </div>
  );
};

export default EntitlementOptionLabel;
