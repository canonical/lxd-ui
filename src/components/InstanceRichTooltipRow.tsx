import type { FC } from "react";

interface Props {
  title: string;
  value: React.ReactNode;
  valueTitle?: string;
}

export const InstanceRichTooltipRow: FC<Props> = ({
  title,
  value,
  valueTitle,
}) => {
  return (
    <tr>
      <th className="u-text--muted">{title}</th>
      <td title={valueTitle} className="u-truncate">
        {value}
      </td>
    </tr>
  );
};
