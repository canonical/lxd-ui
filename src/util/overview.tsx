import type { ReactNode } from "react";
import { Card } from "@canonical/react-components";

export const renderOverviewCard = (
  className: string,
  title: ReactNode,
  content: ReactNode,
  footerLink: ReactNode,
): React.JSX.Element => {
  return (
    <Card className={className} title={title}>
      {content}
      <div className="card-footer">{footerLink}</div>
    </Card>
  );
};
