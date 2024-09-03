import { FC } from "react";
import { Textarea, TextareaProps } from "@canonical/react-components";

const AutoExpandingTextArea: FC<TextareaProps> = (props) => {
  return (
    <div>
      <Textarea {...props} style={{ minHeight: 0 }} grow />
    </div>
  );
};

export default AutoExpandingTextArea;
