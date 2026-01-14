import type { FC } from "react";
import classnames from "classnames";

export interface TooltipRow {
  title: string;
  value: React.ReactNode;
  valueTitle?: string;
  className?: string;
  truncate?: boolean;
}

export const RichTooltipRow: FC<TooltipRow> = ({
  title,
  value,
  valueTitle,
  className,
  truncate = true,
}) => {
  return (
    <tr className={className}>
      <th className="u-text--muted rich-tooltip-row-title">{title}</th>
      <td
        title={valueTitle}
        className={classnames("rich-tooltip-row-content", {
          "u-truncate": truncate,
        })}
      >
        {value}
      </td>
    </tr>
  );
};
