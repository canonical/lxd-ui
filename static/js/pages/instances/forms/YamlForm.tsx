import React, { FC, ReactNode } from "react";
import YamlEditor from "@focus-reactive/react-yaml";

export interface YamlFormValues {
  yaml?: string;
}

interface Props {
  yaml: string;
  setYaml: (text: string) => void;
  children?: ReactNode;
}

const YamlForm: FC<Props> = ({ yaml, setYaml, children }) => {
  return (
    <>
      {children}
      <div>
        <YamlEditor text={yaml} onChange={({ text }) => setYaml(text)} />
      </div>
    </>
  );
};

export default YamlForm;
