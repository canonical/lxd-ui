import type { FC } from "react";
import { KeyboardKey } from "@canonical/react-ds-global";

// shown above the custom disk devices checkbox, instead of the default hint
// that the confirmation button renders at the end of the modal
const ShiftClickHint: FC = () => {
  return (
    <p className="u-hide--small">
      Next time, you can skip this confirmation by holding{" "}
      <KeyboardKey keyValue="shift" /> and clicking the action.
    </p>
  );
};

export default ShiftClickHint;
