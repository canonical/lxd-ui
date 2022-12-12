import React, { FC } from "react";
import YamlEditor from "@focus-reactive/react-yaml";

interface Props {
  title: string;
  config: string;
  setConfig: (cloudInitConfig: string) => void;
}

const CloudInitConfig: FC<Props> = ({ title, config, setConfig }) => {
  return (
    <>
      <h4>
        <code>{title}</code>
      </h4>
      <YamlEditor text={config} onChange={({ text }) => setConfig(text)} />
    </>
  );
};

export default CloudInitConfig;
