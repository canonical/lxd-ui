import { useRef, type FC, type ReactNode, useEffect, useState } from "react";
import classnames from "classnames";
import ReactCodeMirror from "@uiw/react-codemirror";
import { yaml as yamlExtension } from "@codemirror/lang-yaml";
import { useListener } from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import { bespin } from "@uiw/codemirror-theme-bespin";

interface Props {
  yaml: string;
  setYaml?: (text: string) => void;
  children?: ReactNode;
  autoResize?: boolean;
  readOnly?: boolean;
  readOnlyMessage?: string;
}

const YamlForm: FC<Props> = ({
  yaml,
  setYaml,
  children,
  autoResize = false,
  readOnly = false,
  readOnlyMessage,
}) => {
  const [height, setHeight] = useState(200);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateEditorHeight = () => {
    if (!containerRef.current || autoResize) {
      return;
    }

    updateMaxHeight("code-editor-wrapper", "p-bottom-controls");
    setTimeout(() => {
      const height = document
        ?.getElementsByClassName("code-editor-wrapper")
        ?.item(0)
        ?.getBoundingClientRect().height;
      setHeight(height ?? 200);
    }, 100);
  };
  useListener(window, updateEditorHeight, "resize", true);
  useEffect(updateEditorHeight, [containerRef.current]);

  return (
    <>
      {children}
      <div
        ref={containerRef}
        className={classnames("code-editor-wrapper", { "read-only": readOnly })}
      >
        <ReactCodeMirror
          value={yaml}
          extensions={[yamlExtension()]}
          onChange={(value: string | undefined) => {
            if (value && setYaml) {
              setYaml(value);
            }
          }}
          autoFocus
          readOnly={readOnly}
          title={readOnlyMessage}
          theme={bespin}
          height={autoResize ? undefined : `${height}px`}
        />
      </div>
    </>
  );
};

export default YamlForm;
