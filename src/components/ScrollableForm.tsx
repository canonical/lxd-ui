import { FC, ReactNode } from "react";
import ScrollableContainer from "./ScrollableContainer";
import { useNotify } from "@canonical/react-components";

interface Props {
  children: ReactNode;
}

const ScrollableForm: FC<Props> = ({ children }) => {
  const notify = useNotify();
  return (
    <ScrollableContainer
      dependencies={[notify.notification]}
      belowId="form-footer"
    >
      {children}
    </ScrollableContainer>
  );
};

export default ScrollableForm;
