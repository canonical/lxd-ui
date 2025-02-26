import type { FC, ReactNode } from "react";
import ScrollableContainer from "./ScrollableContainer";
import { useNotify } from "@canonical/react-components";

interface Props {
  children: ReactNode;
  className?: string;
}

const ScrollableForm: FC<Props> = ({ children, className }) => {
  const notify = useNotify();
  return (
    <ScrollableContainer
      dependencies={[notify.notification]}
      belowIds={["status-bar", "form-footer"]}
      className={className}
    >
      {children}
    </ScrollableContainer>
  );
};

export default ScrollableForm;
