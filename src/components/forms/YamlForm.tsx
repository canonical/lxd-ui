import React, { FC, ReactNode, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "@use-it/event-listener";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

export interface YamlFormValues {
  yaml?: string;
}

interface Props {
  yaml: string;
  setYaml?: (text: string) => void;
  children?: ReactNode;
  autoResize?: boolean;
  isReadOnly?: boolean;
}

const YamlForm: FC<Props> = ({
  yaml,
  setYaml,
  children,
  autoResize = false,
  isReadOnly = false,
}) => {
  const [editor, setEditor] = useState<IStandaloneCodeEditor | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

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
  useEventListener("resize", updateFormHeight);
  useEffect(updateFormHeight, [editor, containerRef.current, yaml]);

  return (
    <>
      {children}
      <div ref={containerRef} className="code-editor-wrapper">
        <Editor
          defaultValue={yaml}
          language="yaml"
          theme="vs-dark"
          onChange={(value) => value && setYaml && setYaml(value)}
          options={{
            fontSize: 18,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            wrappingStrategy: "advanced",
            minimap: {
              enabled: false,
            },
            overviewRulerLanes: 0,
            readOnly: isReadOnly,
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
