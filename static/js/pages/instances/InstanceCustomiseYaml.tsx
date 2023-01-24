import React, { FC, MouseEvent } from "react";
import { Button, Label } from "@canonical/react-components";
import YamlEditor from "@focus-reactive/react-yaml";

interface Props {
  instanceYaml: string;
  setYaml: (text: string) => void;
  goBack: (e: MouseEvent<HTMLElement>) => void;
}

const InstanceCustomiseYaml: FC<Props> = ({
  instanceYaml,
  setYaml,
  goBack,
}) => {
  return (
    <>
      <Label>YAML configuration</Label>
      <div className="p-instance-yaml">
        <YamlEditor
          text={instanceYaml}
          onChange={({ text }) => setYaml(text)}
        />
      </div>
      <Button type="button" onClick={goBack}>
        Back to basic form
      </Button>
    </>
  );
};

export default InstanceCustomiseYaml;
