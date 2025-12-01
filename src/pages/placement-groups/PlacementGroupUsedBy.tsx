import type { FC } from "react";
import type { LxdPlacementGroup } from "types/placementGroup";
import UsedByRow from "components/UsedByRow";

interface Props {
  placementGroup?: LxdPlacementGroup;
}

const PlacementGroupUsedBy: FC<Props> = ({ placementGroup }) => {
  if (!placementGroup) {
    return null;
  }

  return (
    <table>
      <tbody>
        <UsedByRow entityType="instance" usedBy={placementGroup.used_by} />
        <UsedByRow entityType="profile" usedBy={placementGroup.used_by} />
      </tbody>
    </table>
  );
};

export default PlacementGroupUsedBy;
