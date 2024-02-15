import { FC } from "react";
import YamlForm from "components/forms/YamlForm";

interface Props {
  config: string;
  setConfig?: (cloudInitConfig: string) => void;
}

const CloudInitConfig: FC<Props> = ({ config, setConfig }) => {
  return (
    <div className="cloud-init-config">
      <YamlForm
        yaml={config}
        setYaml={setConfig}
        autoResize={true}
        readOnly={!setConfig}
      />
    </div>
  );
};

export default CloudInitConfig;
