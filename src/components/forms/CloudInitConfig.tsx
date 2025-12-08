import type { FC } from "react";
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
        readOnlyMessage="Read only editor for inherited value. Create an override to modify."
      />
    </div>
  );
};

export default CloudInitConfig;
