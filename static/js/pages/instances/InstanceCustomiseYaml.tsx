import React, { FC, useState } from "react";
import { Button, Label } from "@canonical/react-components";
import YamlEditor from "@focus-reactive/react-yaml";
import ConfirmationButton from "components/ConfirmationButton";

interface Props {
  instanceYaml: string;
  setYaml: (text: string) => void;
  goBack: () => void;
}

const InstanceCustomiseYaml: FC<Props> = ({
  instanceYaml,
  setYaml,
  goBack,
}) => {
  const initialYamlState = useState<string>(instanceYaml);
  return (
    <>
      <Label>YAML configuration</Label>
      <div className="p-instance-yaml">
        <YamlEditor
          text={instanceYaml}
          onChange={({ text }) => setYaml(text)}
        />
      </div>
      {initialYamlState[0] === instanceYaml ? (
        <Button type="button" onClick={goBack}>
          Back to basic form
        </Button>
      ) : (
        <ConfirmationButton
          title="Confirm back to basic form"
          toggleCaption="Back to basic form"
          confirmationMessage={
            "Are you sure you want to go back to the basic form? All the changes applied to the YAML config will be lost."
          }
          posButtonLabel="Go back"
          onConfirm={goBack}
          isDense={false}
        />
      )}
    </>
  );
};

export default InstanceCustomiseYaml;
