import type { ComponentProps, FC } from "react";
import classnames from "classnames";
import DsIcon from "components/DsIcon";
import { statusColors } from "util/statusColors";

type Props = Omit<ComponentProps<typeof DsIcon>, "icon" | "color" | "style"> & {
  title?: string;
};

const ModifiedIcon: FC<Props> = ({ className, title, ...props }) => {
  const icon = (
    <DsIcon
      {...props}
      aria-label={props["aria-label"] ?? title}
      icon="status-small"
      className={classnames(
        "status-icon",
        "status-icon--information",
        className,
      )}
      color={statusColors["information"]}
    />
  );

  return title ? <span title={title}>{icon}</span> : icon;
};

export default ModifiedIcon;
