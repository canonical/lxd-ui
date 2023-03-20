import React, { FC, ReactNode } from "react";
import Editor from "@monaco-editor/react";

export interface YamlFormValues {
  yaml?: string;
}

interface Props {
  yaml: string;
  setYaml: (text: string) => void;
  children?: ReactNode;
  height: string
}

const YamlForm: FC<Props> = ({ yaml, setYaml, children, height = "32rem" }) => {
  return (
    <>
      {children}
      <div>
        <Editor defaultValue={yaml} language="yaml" onChange={(value) => setYaml(value!)} height={height} />
      </div>
    </>
  );
};

export default YamlForm;
