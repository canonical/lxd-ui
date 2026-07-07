import type { FC, ReactNode } from "react";
import classnames from "classnames";

export interface ChartLegendItem {
  color: string;
  label: ReactNode;
}

interface Props {
  items: ChartLegendItem[];
  className?: string;
}

const ChartLegend: FC<Props> = ({ items, className }) => {
  return (
    <ul className={classnames("chart-legend", className)}>
      {items.map((item, index) => (
        <li className="chart-legend__item" key={`${item.color}-${index}`}>
          <span
            className="chart-legend__dot"
            style={{
              backgroundColor: item.color,
            }}
            aria-hidden="true"
          ></span>
          <span className="chart-legend__label">{item.label}</span>
        </li>
      ))}
    </ul>
  );
};

export default ChartLegend;
