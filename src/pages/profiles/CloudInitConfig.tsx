import React, { FC } from "react";
import YamlEditor from "@focus-reactive/react-yaml";
import YamlForm, { YamlFormValues } from "pages/instances/forms/YamlForm";

interface Props {
  title: string;
  config: string;
  setConfig: (cloudInitConfig: string) => void;
}

const CloudInitConfig: FC<Props> = ({ title, config, setConfig }) => {
  return (
    <>
      <YamlForm yaml={config} setYaml={setConfig} autoResize={true}>
        <h5>
          <code>{title}</code>
        </h5>
      </YamlForm>
    </>
  );
};

export default CloudInitConfig;
