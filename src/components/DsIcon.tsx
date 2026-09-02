import { Icon, type IconProps } from "@canonical/react-ds-global";
import type { FC } from "react";
import { ROOT_PATH } from "util/rootPath";

type Props = Omit<IconProps, "rootPath">;

// Wraps the Pragma DsIcon component, presetting the rootPath so callers
// don't need to repeat it at every call site.
const DsIcon: FC<Props> = (props) => (
  <Icon {...props} rootPath={`${ROOT_PATH}/ui/assets/icons`} />
);

export default DsIcon;
