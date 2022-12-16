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
      <h5>
        <code>{title}</code>
      </h5>
      <YamlEditor text={config} onChange={({ text }) => setConfig(text)} />
    </>
  );
};

export default CloudInitConfig;
