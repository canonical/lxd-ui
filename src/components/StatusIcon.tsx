import type { ComponentProps, FC } from "react";
import classnames from "classnames";
import DsIcon from "components/DsIcon";
import { statusColors, type StatusTone } from "util/statusColors";

interface Props extends Omit<
  ComponentProps<typeof DsIcon>,
  "icon" | "color" | "style"
> {
  tone: StatusTone;
}

const StatusIcon: FC<Props> = ({ tone, className, ...props }) => (
  <DsIcon
    {...props}
    icon="status-small"
    className={classnames("status-icon", `status-icon--${tone}`, className)}
    color={
      tone === "neutral"
        ? `var(--status-color-neutral, ${statusColors.neutral})`
        : statusColors[tone]
    }
  />
);

export default StatusIcon;
