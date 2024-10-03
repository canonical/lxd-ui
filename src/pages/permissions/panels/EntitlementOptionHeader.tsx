import { FC } from "react";

const EntitlementOptionHeader: FC = () => {
  return (
    <div className="header">
      <span className="entitlement u-no-margin--bottom">entitlement</span>
      <span className="entitlement-description u-no-margin--bottom">
        description
      </span>
    </div>
  );
};

export default EntitlementOptionHeader;
