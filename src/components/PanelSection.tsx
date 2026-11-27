import type { ReactNode, FC } from "react";

interface Props {
  children: ReactNode;
  header: string;
  isFirst?: boolean;
}

const PanelSection: FC<Props> = ({ isFirst, children, header }) => {
  return (
    <div className="panel-section">
      {!isFirst && <hr />}
      <h2 className="p-muted-heading">{header}</h2>
      {children}
    </div>
  );
};

export default PanelSection;
