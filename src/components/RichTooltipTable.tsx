import { type FC } from "react";
import { RichTooltipRow, type TooltipRow } from "./RichTooltipRow";
import classNames from "classnames";
interface Props {
  rows: TooltipRow[];
  className?: string;
}

// Corresponding breakpoints exist in src/sass/_rich_tooltip.scss to adjust height of tooltip accordingly
export const SMALL_TOOLTIP_BREAKPOINT = 500;
export const MEDIUM_TOOLTIP_BREAKPOINT = 900;
export const LARGE_TOOLTIP_BREAKPOINT = 1100;

export const RichTooltipTable: FC<Props> = ({ rows, className }) => {
  return (
    <table
      className={classNames(
        "u-table-layout--auto u-no-margin--bottom rich-tooltip-table",
        className,
      )}
    >
      <tbody>
        {rows.map((row, index) => (
          <RichTooltipRow
            key={index}
            title={row.title}
            value={row.value}
            valueTitle={row.valueTitle}
            className={row.className}
            truncate={row.truncate}
          />
        ))}
      </tbody>
    </table>
  );
};
