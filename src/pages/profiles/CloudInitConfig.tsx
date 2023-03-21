import React, { FC } from "react";
import YamlForm from "pages/instances/forms/YamlForm";

interface Props {
  config: string;
  setConfig: (cloudInitConfig: string) => void;
}

const CloudInitConfig: FC<Props> = ({ config, setConfig }) => {
  return <YamlForm yaml={config} setYaml={setConfig} autoResize={true} />;
};

export default CloudInitConfig;
