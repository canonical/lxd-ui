import type { FC } from "react";
export interface TooltipRow {
  title: string;
  value: React.ReactNode;
  valueTitle?: string;
  className?: string;
}

export const RichTooltipRow: FC<TooltipRow> = ({
  title,
  value,
  valueTitle,
  className,
}) => {
  return (
    <tr className={className}>
      <th className="u-text--muted rich-tooltip-row-title">{title}</th>
      <td title={valueTitle} className="u-truncate rich-tooltip-row-content">
        {value}
      </td>
    </tr>
  );
};
