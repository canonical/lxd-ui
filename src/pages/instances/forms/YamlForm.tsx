import React, { FC, ReactNode, useEffect, useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";

export interface YamlFormValues {
  yaml?: string;
}

interface Props {
  yaml: string;
  setYaml: (text: string) => void;
  children?: ReactNode;
  autoResize?: boolean
}

const YamlForm: FC<Props> = ({ yaml, setYaml, children, autoResize = false }) => {
  const [editor, setEditor] = React.useState<Monaco>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(editor) {
      let expandEditor = () => {
        const contentHeight = Math.min(500, editor.getContentHeight());
        containerRef.current!.style.height = `${contentHeight}px`;
        editor.layout();
      };
      if(autoResize) {
        editor.onDidContentSizeChange(expandEditor);
      }
      expandEditor()
    }
  }, [editor])

  return (
    <>
      {children}
      <div ref={containerRef} style={{
        height: !autoResize ? "32rem" : undefined,
      }}>
        <Editor defaultValue={yaml} language="yaml" onChange={(value) => setYaml(value!)}
          options={{
            fontSize: 18,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            wrappingStrategy: 'advanced',
            minimap: {
              enabled: false
            },
            overviewRulerLanes: 0,
          }}
          onMount={editor => {
            setEditor(editor);
          }} />
      </div>
    </>
  );
};

export default YamlForm;
