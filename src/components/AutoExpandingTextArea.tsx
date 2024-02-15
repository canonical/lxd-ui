import { FC, useLayoutEffect } from "react";
import { Textarea, TextareaProps } from "@canonical/react-components";

type Props = {
  dynamicHeight?: boolean;
  value?: string;
} & TextareaProps;

const AutoExpandingTextArea: FC<Props> = (props) => {
  const { dynamicHeight, ...textAreaProps } = props;
  const { id, value, rows } = textAreaProps;

  useLayoutEffect(() => {
    if (dynamicHeight) {
      const textArea = document.getElementById(id || "");
      if (textArea) {
        textArea.style.height = "0px";
        const scrollHeight = textArea.scrollHeight;
        textArea.style.height = `${scrollHeight}px`;
      }
    }
  }, [value]);

  return (
    <div>
      <Textarea
        {...(textAreaProps as TextareaProps)}
        rows={dynamicHeight ? undefined : rows}
        className="auto-expanding-textarea"
      />
    </div>
  );
};

export default AutoExpandingTextArea;
