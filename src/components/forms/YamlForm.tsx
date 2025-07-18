import type { FC, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Editor, loader } from "@monaco-editor/react";
import { updateMaxHeight } from "util/updateMaxHeight";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import classnames from "classnames";
import { useListener } from "@canonical/react-components";

export interface YamlFormValues {
  yaml?: string;
}

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
  const [editor, setEditor] = useState<IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  loader.config({ paths: { vs: "/ui/monaco-editor/min/vs" } });

  const updateFormHeight = () => {
    if (!editor || !containerRef.current) {
      return;
    }
    if (autoResize) {
      editor.layout();
      const contentHeight = editor.getContentHeight();
      containerRef.current.style.height = `${contentHeight}px`;
    } else {
      updateMaxHeight("code-editor-wrapper", "p-bottom-controls");
    }
    editor.layout();
  };
  useListener(window, updateFormHeight, "resize", true);
  useEffect(updateFormHeight, [editor, containerRef.current, yaml]);

  return (
    <>
      {children}
      <div
        ref={containerRef}
        className={classnames("code-editor-wrapper", { "read-only": readOnly })}
      >
        <Editor
          defaultValue={yaml}
          language="yaml"
          theme="hc-black"
          onChange={(value: string | undefined) => {
            if (value && setYaml) {
              setYaml(value);
            }
          }}
          options={{
            fontSize: 18,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            wrappingStrategy: "advanced",
            minimap: {
              enabled: false,
            },
            overviewRulerLanes: 0,
            readOnly: readOnly,
            readOnlyMessage: { value: readOnlyMessage ?? "" },
          }}
          onMount={(editor: IStandaloneCodeEditor) => {
            setEditor(editor);
            editor.focus();
          }}
        />
      </div>
    </>
  );
};

export default YamlForm;
