import type { FC } from "react";
import type { TextareaProps } from "@canonical/react-components";
import { Textarea } from "@canonical/react-components";

const AutoExpandingTextArea: FC<TextareaProps> = (props) => {
  return (
    <div>
      <Textarea {...props} style={{ minHeight: 0 }} grow />
    </div>
  );
};

export default AutoExpandingTextArea;
