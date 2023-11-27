import React, { FC, useLayoutEffect } from "react";
import { Textarea, TextareaProps } from "@canonical/react-components";

type Props = {
  dynamicHeight?: boolean;
  value?: string;
} & TextareaProps;

const AutoExpandingTextArea: FC<Props> = (props) => {
  const { dynamicHeight, id, value, rows } = props;

  useLayoutEffect(() => {
    if (dynamicHeight) {
      const textArea = document.getElementById(id || "");
      if (textArea) {
        textArea.style.height = "0px";
        const scrollHeight = textArea.scrollHeight;
        textArea.style.height = `${scrollHeight + 1}px`;
      }
    }
  }, [value]);

  return (
    <div>
      <Textarea
        {...(props as TextareaProps)}
        rows={dynamicHeight ? undefined : rows}
      />
    </div>
  );
};

export default AutoExpandingTextArea;
