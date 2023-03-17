import React, { FC } from "react";
import YamlForm from "pages/instances/forms/YamlForm";

interface Props {
  title: string;
  config: string;
  setConfig: (cloudInitConfig: string) => void;
}

const CloudInitConfig: FC<Props> = ({ title, config, setConfig }) => {
  return (
    <div>
      <h5>
        <code>{title}</code>
      </h5>
      <YamlForm yaml={config} setYaml={setConfig} autoResize={true} />
    </div>
  );
};

export default CloudInitConfig;
